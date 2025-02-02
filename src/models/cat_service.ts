import { conn, mongoose, tableID } from "./-dbConnector"
const Schema = mongoose.Schema;

const BusinessCat = new Schema({
   title: {
      type: String,
      unique: true,
      index: true,
      required: true
   }
}, {
   timestamps: true,
   minimize: false,
   id: true
})

const SearchKeywords = new Schema({
   title: {
      type: String,
      index: true,
      required: true
   },
   count: {
      type: Number,
      index: true,
      default: 0
   },
}, {
   timestamps: true,
   minimize: false,
   id: true
})

const BusinessCatModel = conn.model("biz_categories", BusinessCat)
const SearchWordModel = conn.model("search_keywords", SearchKeywords)
export { BusinessCatModel, SearchWordModel }