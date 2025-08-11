import type { Context } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'
import { SubmissionSchema } from "../../form.schema";
import z from "zod";

const supabase = createClient<Database>(process.env.DB_URL!, process.env.DB_API_KEY!)

export default async (req: Request, context: Context) => {
  const referer = req.headers.get('referer');
  const url = new URL(req.url);
  const fields = Object.fromEntries(url.searchParams);

  if(referer) {
    const validation = SubmissionSchema.safeParse(fields);

    if (!validation.success) {
      const errorUrl = new URL(referer);
      errorUrl.searchParams.set('status', 'error');

      const errors = z.flattenError(validation.error);

      Object.keys(errors.fieldErrors).forEach(field => {
        errorUrl.searchParams.set(`${field}Error`, errors.fieldErrors[field].join('. ') + '.');
      });

      Object.keys(fields).forEach(field => {
        errorUrl.searchParams.set(field, fields[field]);
      });

      return Response.redirect(errorUrl.href);
    } else {
      const { data, error, status, statusText } = await supabase
        .from('submissions')
        .insert(fields)
        .select()
      ;

      // console.log(result.data, data, error, status, statusText);

      const successUrl = new URL(referer);
      successUrl.searchParams.set('status', 'success');

      Object.keys(fields).forEach(field => {
        successUrl.searchParams.set(field, fields[field]);
      });

      return Response.redirect(successUrl.href);
    }
  }
}