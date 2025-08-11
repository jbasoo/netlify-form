import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const referer = req.headers.get('referer');

  console.log({
    'url': url,
    'referer': referer
  });

  if(referer) {
    return Response.redirect(referer);
  }
  else {
    return new Response("Hello, world!");
  }
}

// import type { Handler } from "@netlify/functions";

// export const handler: Handler = async (event, context) => {
//     console.log('test');

//     return {
//         body: JSON.stringify({ message: "Hello World" }),
//         statusCode: 200,
//     }
// }




// import type { Handler } from '@netlify/functions';

// export const handler: Handler = async (event) => {
//     if (event.httpMethod !== 'POST') {
//         return {
//             statusCode: 405,
//             body: 'Method Not Allowed',
//         };
//     }

//     let data;
//     try {
//         data = JSON.parse(event.body || '{}');
//     } catch (error) {
//         return {
//             statusCode: 400,
//             body: 'Invalid JSON',
//         };
//     }

//     console.log('Form submission received:', data);

//     return {
//         statusCode: 200,
//         body: JSON.stringify({ message: 'Form submission received' }),
//     };
// };