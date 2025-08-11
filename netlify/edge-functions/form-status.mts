
// Import HTMLRewriter for server-side HTML manipulation
import { HTMLRewriter } from "https://ghuc.cc/worker-tools/html-rewriter/index.ts";

export default async (request, context) => {
  const response = await context.next();

  // Parse the request URL and extract query parameters
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);

  // Map form field names to their input types
  const fields = {
    'email': 'input',
    'firstName': 'input',
    'lastName': 'input',
    'message': 'textarea'
  };

  // Find all query params that indicate field errors
  const errorParams = Object.keys(params).filter(param => param.includes('Error'));

  // Create a new HTMLRewriter instance for DOM manipulation
  const rewriter = new HTMLRewriter();


  // If there are query params, use their values to pre-fill form fields
  if(params) {
    Object.keys(fields).forEach(field => {
      rewriter.on(`#${field}`, {
        element: (element) => {
          // For input fields, set the value attribute
          if(fields[field] == 'input') {
            element.setAttribute('value', url.searchParams.get(field))
          }

          // For textarea fields, prepend the value as text
          if(fields[field] == 'textarea') {
            element.prepend(url.searchParams.get(field))
          }
        },
      })
    });
  }


  // If the form was submitted successfully, add a success message above the form
  if(params?.status == 'success') {
    rewriter.on("form", {
      element: (element) => {
        element.prepend(`
          <p class="form-success">Message recieved!</p>
        `, { html: true });
      },
    });

    // Return the modified HTML response with the success message
    return rewriter.transform(response);
  }


  // If there are validation errors, add error messages to the relevant fields
  if(params?.status == 'error') {
    errorParams.forEach(param => {
      // Get the field name by removing 'Error' from the param
      const fieldParamName = param.replace('Error', '');

      // Append an error message to the field's container
      rewriter.on(`#${fieldParamName}Field`, {
        element: (element) => {
          element.append(`
            <p class="field-error" id="error-${fieldParamName}">${url.searchParams.get(param)}</p>
          `, { html: true });
        },
      });

      // Set aria-describedby for accessibility on the input/textarea
      rewriter.on(`#${fieldParamName}`, {
        element: (element) => {
          element.setAttribute('aria-describedby', `error-${fieldParamName}`);
        },
      });
    });

    // Return the modified HTML response with error messages
    return rewriter.transform(response);
  }
};