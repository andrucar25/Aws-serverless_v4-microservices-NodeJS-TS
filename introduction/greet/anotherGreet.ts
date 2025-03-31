export const anotherGreet = async (event) => {
  try {
    
    //parse the request body from JSON format to JS object
    const body = JSON.parse(event.body);

    const name = body.name;

    if(!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          msg: "Name is required"
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        msg: `Hello ${name}`
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        msg: `An error ocurred while processing request`
      }),
    };
  }
}