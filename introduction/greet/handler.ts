export const greet = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Serverless v4! Greet function",
    }),
  };
};
