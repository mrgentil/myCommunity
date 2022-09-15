const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Le compte a été mis à jour");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("Vous ne pouvez mettre à jour que votre compte !");
    }
});

//delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Le compte a été supprimé");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("Vous ne pouvez supprimer que votre compte !");
    }
});

//get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("l'utilisateur a été suivi");
            } else {
                res.status(403).json("Vous suivez déjà cet utilisateur");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("Vous ne pouvez pas vous suivre vous-même");
    }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("l'utilisateur n'est plus suivi");
            } else {
                res.status(403).json("Vous ne suivez pas cet utilisateur");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("On ne peut pas s'effacer soi-même");
    }
});

module.exports = router;
