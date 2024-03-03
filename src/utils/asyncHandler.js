const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
      .then((result) => {
        if (typeof result !== "undefined") {
          res.send(result); // Or whatever action you want to take with the result
        } else {
          next(); // Proceed to the next middleware
        }
      })
      .catch((err) => next(err));
  };
};

export { asyncHandler };
