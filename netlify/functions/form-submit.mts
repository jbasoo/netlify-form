
// Import Supabase client and types
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'
// Import Zod schema for validation
import { SubmissionSchema } from "../../form.schema";
import z from "zod";

// Initialize Supabase client with environment variables
const supabase = createClient<Database>(process.env.DB_URL!, process.env.DB_API_KEY!)

export default async (req: Request) => {
  // Get the referer header to redirect back to the form page
  const referer = req.headers.get('referer');
  // Parse the request URL and extract form fields from query params
  const requestUrl = new URL(req.url);
  const fields = Object.fromEntries(requestUrl.searchParams);

  // Only proceed if referer is present (i.e., form was submitted from a page)
  if(referer) {
    // Validate the form fields using Zod schema
    const validation = SubmissionSchema.safeParse(fields);
    // Parse the referer URL and strip query params for clean redirects
    let refererUrl = new URL(referer);
    let url = new URL(refererUrl.origin + refererUrl.pathname)

    if (!validation.success) {
      // If validation fails, set error status param
      url.searchParams.set('status', 'error');

      // Flatten Zod errors for easier handling
      const errors = z.flattenError(validation.error);

      // Add each field's error message as a query param
      Object.keys(errors.fieldErrors).forEach(field => {
        url.searchParams.set(`${field}Error`, errors.fieldErrors[field].join('. ') + '.');
      });

      // Preserve user input by adding field values to the redirect URL params
      Object.keys(fields).forEach(field => {
        url.searchParams.set(field, fields[field]);
      });
    }
    else {
      // If validation succeeds, insert the submission into the database
      const { data, error, status, statusText } = await supabase
        .from('submissions')
        .insert(fields)
        .select()
      ;

      // DB error handling would go here. For now let's naively assume Supabase never goes down.

      // Set success status in the redirect URL
      url.searchParams.set('status', 'success');

      // Preserve user input by adding field values to the redirect URL
      Object.keys(fields).forEach(field => {
        url.searchParams.set(field, fields[field]);
      });
    }

    // Redirect back to the form with status and values
    return Response.redirect(url.href);
  }
}