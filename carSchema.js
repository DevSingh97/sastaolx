const mongoose = require('mongoose');

const carSchema = mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId
    } ,
    carname: String,
    carprice : String,
    contact : String,
    carimg : {
        type : String,
        required : true,
        default : '../images/uploads/def.jpg'
    }
});

module.exports = mongoose.model('car', carSchema);

