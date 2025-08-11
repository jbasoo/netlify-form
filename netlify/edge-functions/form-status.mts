import { HTMLRewriter } from "https://ghuc.cc/worker-tools/html-rewriter/index.ts";

export default async (request, context) => {
  const response = await context.next();
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const fields = {
    'email': 'input',
    'firstName': 'input',
    'lastName': 'input',
    'message': 'textarea'
  };
  const errorParams = Object.keys(params).filter(param => param.includes('Error'));
  const rewriter = new HTMLRewriter();

  if(params) {
    Object.keys(fields).forEach(field => {
      rewriter.on(`#${field}`, {
        element: (element) => {
          if(fields[field] == 'input') {
            element.setAttribute('value', url.searchParams.get(field))
          }

          if(fields[field] == 'textarea') {
            element.prepend(url.searchParams.get(field))
          }
        },
      })
    });
  }

  if(params?.status == 'success') {
    rewriter.on("form", {
      element: (element) => {
        element.prepend(`
          <p class="form-success">Message recieved!</p>
        `, { html: true });
      },
    });

    return rewriter.transform(response);
  }

  if(params?.status == 'error') {
    errorParams.forEach(param => {
      const fieldParamName = param.replace('Error', '');
      console.log(param, fieldParamName, url.searchParams.get(param));
      console.log(fieldParamName);

      rewriter.on(`#${fieldParamName}Field`, {
        element: (element) => {
          element.append(`
            <p class="field-error" id="error-${fieldParamName}">${url.searchParams.get(param)}</p>
          `, { html: true });
        },
      });

      rewriter.on(`#${fieldParamName}`, {
        element: (element) => {
          element.setAttribute('aria-describedby', `error-${fieldParamName}`);
        },
      });
    });


    return rewriter.transform(response);
  }
};