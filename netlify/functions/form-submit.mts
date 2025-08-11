import { createClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'
import { SubmissionSchema } from "../../form.schema";
import z from "zod";

const supabase = createClient<Database>(process.env.DB_URL!, process.env.DB_API_KEY!)

export default async (req: Request) => {
  const referer = req.headers.get('referer');
  const requestUrl = new URL(req.url);
  const fields = Object.fromEntries(requestUrl.searchParams);

  if(referer) {
    const validation = SubmissionSchema.safeParse(fields);
    let refererUrl = new URL(referer);
    let url = new URL(refererUrl.origin + refererUrl.pathname)

    if (!validation.success) {
      url.searchParams.set('status', 'error');

      const errors = z.flattenError(validation.error);

      Object.keys(errors.fieldErrors).forEach(field => {
        url.searchParams.set(`${field}Error`, errors.fieldErrors[field].join('. ') + '.');
      });

      Object.keys(fields).forEach(field => {
        url.searchParams.set(field, fields[field]);
      });
    }
    else {
      const { data, error, status, statusText } = await supabase
        .from('submissions')
        .insert(fields)
        .select()
      ;

      // TODO: DB error handling would go here. For now let's naively assume Supabase never goes down.

      url.searchParams.set('status', 'success');

      Object.keys(fields).forEach(field => {
        url.searchParams.set(field, fields[field]);
      });
    }

    return Response.redirect(url.href);
  }
}