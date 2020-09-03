/**
 * User model
 * @property
 * id
 * name
 * avatarUrl
 * uid
 * isAdmin
 * oauthCode
 * oauthCodeCreated
 * status
 */
class UserModel {
    USER_COLLECTION = 'users';
    constructor(db){
        this.db = db;
        this.user = db.collection(this.USER_COLLECTION);
    }

    async get(){
        let response = [];
        await this.user.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    avatarUrl: doc.data().avatarUrl,
                    uid: doc.data().uid,
                    isAdmin: doc.data().isAdmin,
                    oauthCode: doc.data().oauthCode,
                    oauthCodeCreated: doc.data().oauthCodeCreated,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async add(name, avatarUrl, uid, isAdmin, oauthCode, oauthCodeCreated, status){
        let userObject = {
            name,
            avatarUrl,
            uid,
            isAdmin,
            oauthCode,
            oauthCodeCreated,
            status
        };
        const checkUserExist = await this.findByUid(uid);
        if(checkUserExist.length === 0){
            await this.user.doc().create(userObject);
        } else {
            userObject = checkUserExist[0];
            await this.update(userObject.id, userObject.name, userObject.avatarUrl, userObject.uid, userObject.isAdmin, oauthCode, oauthCodeCreated, userObject.status);
        }

        return userObject;
    }

    async findByUid(uid){
        let response = [];
        await this.user.where('uid', '==', uid).get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    avatarUrl: doc.data().avatarUrl,
                    uid: doc.data().uid,
                    isAdmin: doc.data().isAdmin,
                    oauthCode: doc.data().oauthCode,
                    oauthCodeCreated: doc.data().oauthCodeCreated,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async getActiveUser(){
        let response = [];
        await this.user.where('status', '==', true).get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    avatarUrl: doc.data().avatarUrl,
                    uid: doc.data().uid,
                    isAdmin: doc.data().isAdmin,
                    oauthCode: doc.data().oauthCode,
                    oauthCodeCreated: doc.data().oauthCodeCreated,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async getAdminUser(){
        let response = [];
        await this.user.where('isAdmin', '==', true).get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    avatarUrl: doc.data().avatarUrl,
                    uid: doc.data().uid,
                    isAdmin: doc.data().isAdmin,
                    oauthCode: doc.data().oauthCode,
                    oauthCodeCreated: doc.data().oauthCodeCreated,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async findById(id){
        const document = this.user.doc(id);
        let user = await document.get();
        let response = user.data();
        return response;
    }


    async update(id, name, avatarUrl, uid, isAdmin, oauthCode, oauthCodeCreated, status){
        try {
            const document = this.user.doc(id);
            await document.update({
                name,
                avatarUrl,
                uid,
                isAdmin,
                oauthCode,
                oauthCodeCreated,
                status
            });
            return true;
        } catch(error){
            return false;
        }
    }

    async changeUserStatus(id, status){
        try {
            const document = this.user.doc(id);
            await document.update({
                status
            });
            return true;
        } catch(error){
            return false;
        }
    }

    async delete(id){
        try {
            const document = this.user.doc(id);
            await document.delete();
            return true;
        } catch (error) {
            return false;
        }
    }


}

module.exports = UserModel;