class ApiFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    filter(){
        const excludeFields = ['sort', 'page', 'limit', 'fields']; 

        const queryObj = {...this.queryStr};

        excludeFields.forEach((el)=>{
            delete  queryObj[el];
        });        

        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryString));

        return this;
    }

    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }
        else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    paginate(){
        const page = +this.queryStr.page || 1;
        const limit = +this.queryStr.limit || 10;
        const skip = (page-1)*limit;
        this.query = this.query.skip(skip).limit(limit);

        // if(this.queryStr.page){
        //     const productsCount = await Product.countDocuments();
        //     if(skip >= productsCount){
        //         throw new Error('Page not found!');
        //     }
        // }

        return this;
    }

}
module.exports = ApiFeatures;