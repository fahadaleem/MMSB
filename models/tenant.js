const TenantSchema = new Schema({
  hospital_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  contact_info: { type: String },
  admin_id: { type: String, ref: "User" }, // Reference to admin managing this hospital
});

module.exports = mongoose.model("TenantSchema", TenantSchema);
