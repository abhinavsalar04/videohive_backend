export function asyncHandler(requestHandler) {
  return async function (req, res, next) {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

export function asyncHandlerUsingPromise(requestHandler) {
  
    /**
  * This type of Promise handle handles both promise & non-promise value.
  * It create a wrapper - for non-promise value it wraps them in a new prmise
    but for promise value then it uses them directly. In either case it retuns the
    resolved promise so use of .then or .catch is not needed. As errors will be taken care here.
  */
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    });
  };

  /*   
  * In the below function we have full control on Promise using resolve, 
    reject but we need some logic to use reject.
  * Another issue is we can not use catch here directly instead we need to 
    use .then,  .catch to handle the Promise retuned by the function.
  * It can not handle non-promise requestHandler.
 
 */

  //   return function (req, res, next) {
  //     new Promise((resolve, reject) => {
  //       resolve(requestHandler(req, res, next));
  //     });
  //   };
}
