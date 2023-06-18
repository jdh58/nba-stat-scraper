import mongoose, { SchemaType } from 'mongoose';

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  league: { type: String, required: true, minLength: 1, maxLength: 5 },
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
  picture: { type: String, required: true, maxLength: 100 },
  stats: { type: Schema.Types.Subdocument, required: true },
  funFacts: { type: Array, required: true },
  nicknames: { type: Array, required: true },
  championships: { type: Number, required: true },
  college: { type: String, required: true },
  pick: { type: Number, required: true },
  country_of_birth: { type: String, required: true, maxLength: 50 },
  birth_date: { type: Date, required: true },
  first_year: { type: Number, required: true },
  last_year: { type: Number, required: true },
});

export default mongoose.model('Player', PlayerSchema);
