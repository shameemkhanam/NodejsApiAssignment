//to remove the repeating try catch blocks
module.exports = (asyncfunc) => {
    return (req, res, next)=>{
        asyncfunc(req, res, next).catch(err => next(err));
    }
}