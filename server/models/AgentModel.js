/**
 * User model
 * @property
 * id
 * name
 * ip
 * lastHelloSend
 * status
 */

class AgentModel {
    AGENT_COLLECTION = 'agents';
    constructor(db){
        this.db = db;
        this.agent = db.collection(this.AGENT_COLLECTION);
    }

    async get(){
        let response = [];
        await this.agent.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    ip: doc.data().ip,
                    lastHelloSend: doc.data().lastHelloSend,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async add(name, ip, lastHelloSend, status){
        let agentObject = {
            name,
            ip,
            lastHelloSend,
            status,

        };
        const agents = await this.findAgentByIP(ip);
        if(agents.length === 0){
            await this.agent.doc().create(agentObject);
        } else {
            const agent = agents[0];
            await this.update(agent.id, name, ip, lastHelloSend, status);
        }
    }

    async findAgentByIP(ip){
        let response = [];
        await this.agent.where('ip', '==', ip).get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    ip: doc.data().ip,
                    lastHelloSend: doc.data().lastHelloSend,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async findActiveAgent(){
        let response = [];
        await this.agent.where('status', '==', true).get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    ip: doc.data().ip,
                    lastHelloSend: doc.data().lastHelloSend,
                    status: doc.data().status
                };
                response.push(selectedItem);
            }
        });
        return response;
    }

    async findById(id){
        const document = this.agent.doc(id);
        let user = await document.get();
        let response = user.data();
        return response;
    }


    async update(id, name, ip, lastHelloSend, status){
        try {
            const document = this.agent.doc(id);
            await document.update({
                name,
                ip,
                lastHelloSend,
                status
            });
            return true;
        } catch(error){
            return false;
        }
    }

    async updateStatus(id, status){
        try {
            const document = this.agent.doc(id);
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
            const document = this.agent.doc(id);
            await document.delete();
            return true;
        } catch (error) {
            return false;
        }
    }


}

module.exports = AgentModel;