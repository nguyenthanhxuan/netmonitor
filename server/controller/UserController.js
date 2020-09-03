const UserModel = require('../models/UserModel');

module.exports.getAllUser = async function(db){
    const userDocument = new UserModel(db);
    const users = await userDocument.get();
    return users;
}

module.exports.getAdminUser = async function(db){
    const userDocument = new UserModel(db);
    const admin = await userDocument.getAdminUser();
    return admin[0];
}

module.exports.getActiveUser = async function(db){
    const userDocument = new UserModel(db);
    const users = await userDocument.getActiveUser();
    return users;
}


module.exports.removeAdminUser = function(users){
    return users.filter(function(user){
        return user.isAdmin == false;
    })
};

module.exports.getUserHasLine = function(users){
    return users.filter(function(user){
        return user.lineID != '';
    })
};


module.exports.userDisable = async function(db, uid){
    const userDocument = new UserModel(db);
    let confirm = await userDocument.changeUserStatus(uid, false);
    return confirm;
}

module.exports.userEnable = async function(db, uid){
    const userDocument = new UserModel(db);
    let confirm = await userDocument.changeUserStatus(uid, true);
    return confirm;
}