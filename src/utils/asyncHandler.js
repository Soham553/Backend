// const asyncHandler = (fn) => async (res, req, next) => {
//     try {

//         await fn(res, req, next)
        
//     } catch (error) {
//         res.status(error).json({
//             succes : false,
//             message : error
//         })
//     }
// }


const asyncHandler = (requestHeader) => {
    Promise
    .resolve(requestHeader(req, res, next))
    .catch((error) => next(error))
}


export {asyncHandler}