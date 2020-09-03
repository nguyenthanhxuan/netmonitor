const AgentModel = require('../models/AgentModel');
module.exports.addAgent = function(db, name, ip, lastHelloSend, status){
    (async () => {
        let agent = new AgentModel(db);
        await agent.add(name, ip, lastHelloSend, status);
    })();
}


module.exports.getAllAgent = async function(db){
    let agentModel = new AgentModel(db);
    let agents = await agentModel.get();
    return agents;
}


module.exports.getActiveAgent = async function(db){
    let agentModel = new AgentModel(db);
    let agents = await agentModel.findActiveAgent();
    return agents;
}

module.exports.deleteAgent = async function(db, id){
    let agentModel = new AgentModel(db);
    let deleteAgent = await agentModel.delete(id);
    return deleteAgent;
}

module.exports.changeAgentStatus = async function(db, id, status){
    let agentModel = new AgentModel(db);
    let update = agentModel.updateStatus(id, status);
    return update;
}