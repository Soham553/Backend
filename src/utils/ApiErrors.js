class ApiErrors extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.data = null;
        this.message
        this.success
        this.errors = errors

        if(stack){
            this.statck = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiErrors}