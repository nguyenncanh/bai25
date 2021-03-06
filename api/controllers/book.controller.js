var express = require("express");
var router = express.Router();
//const db = require("../db");
//const shortid = require("shortid");
var Book = require('../../models/book.model');
var cloudinary = require("cloudinary").v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

module.exports.getBooks = async (req, res) => {
    var books = await Book.find();
    if (!req.params.q) {
        return res.status(200).json({ books: books });
    } else {
        var q = req.query.q;
        var macthBooks = books.filter(function (book) {
            return book.title.toLowerCase().indexOf(q.toLowerCase()) != -1;
        });

        return res.status(200).json({ books: macthBooks, searchValue: q });
    }
    
};

module.exports.getBook = async function (req, res) {
    var id = req.params.id;

    var book = await Book.findById(id);

    return res.status(200).json({
        book: book
    });
};

module.exports.deleteBook = async function (req, res) {
    var id = req.params.id;
    await Book.findByIdAndRemove(id).exec();

    return res.status(200).json("Delete success!");
};

module.exports.updateBook = async function (req, res) {
    var id = req.params.id;
    const { title, des } = req.body;
    // Cập nhật dữ liệu
    await Book.findByIdAndUpdate(id, {title, des});

    return res.status(200).json("Update success!");
};

module.exports.createBook = async function (req, res) {
    var path = "";

    if (!req.file) {
        path = "https://picsum.photos/286/180";
    } else {
        path = await cloudinary.uploader.upload(req.file.path).then(doc => doc.url);
    }

    var newBook = new Book({
        title: req.body.title,
        des: req.body.des,
        coverUrl: path
    });
    await newBook.save();

    if (req.file) {
        fs.unlinkSync(req.file.path);
    }

    return res.status(200).json("Create success!");
};
