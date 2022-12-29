const asyncHandler = require("express-async-handler");
const Product = require("../models/product");
const { fileSizeFormatter } = require("../helpers/fileUpload");
const cloudinary = require("../helpers/Cloudinary");
const fs = require('fs')
const { promisify } = require('util');
const path = require("path");

const unlinkAsync = promisify(fs.unlink)

// date formate

const date=new Date();  
const day=date.getDate();
const month=date.getMonth();
const year=date.getFullYear();

// Create Prouct
const createProduct = asyncHandler(async (req, res) => {
  let user = req.headers["user"];

  const { name, sku, category, quantity, price, description } = req.body;

  //   Validation
  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Inventory_Products",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: day+"-"+month+"-"+year + "-" + req.file.originalname,
      filePath: uploadedFile.secure_url,
      public_id:uploadedFile.public_id,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  
  // Create Product
  const product = await Product.create({
    
    user: user._id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: fileData,
  });

  res.status(201).json(product);
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  let user = req.headers["user"];
  const products = await Product.find({ user: user._id }).sort("-createdAt");
  res.status(200).json(products);
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  let user = req.headers["user"];
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== user._id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(product);
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  let user = req.headers["user"];
  console.log(user._id)
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
 
  if (product.user.toString() !== user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized");
  }
  
  filePath = path.join( 'uploads',product.image.fileName);
  const IsFile=fs.existsSync(filePath)
 if(IsFile){
  unlinkAsync(filePath)
 }
 const clu_Img=product.image.public_id
 await cloudinary.uploader.destroy(clu_Img)
  await product.remove();
  res.status(200).json({ message: "Product deleted." });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  let user = req.headers["user"];
  const { name, category, quantity, price, description } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== user._id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  filePath = path.join( 'uploads',product.image.fileName);
  const IsFile=fs.existsSync(filePath)
 if(IsFile){
  unlinkAsync(filePath)
 }
 const clu_Img=product.image.public_id
 await cloudinary.uploader.destroy(clu_Img)
  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Inventory_Products",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: day+"-"+month+"-"+year + "-" + req.file.originalname,
      filePath: uploadedFile.secure_url,
      public_id:uploadedFile.public_id,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
 
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  
  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
