handlers.storeIPaddress = function (args, context) {
 
    var psEvent = context.playStreamEvent;
    var IPAddress = psEvent.IPV4Address;
 
    var request = {
        PlayFabId: currentPlayerId,
        Data: {
            "IPAddress": IPAddress
        }
    }
    var result = server.UpdateUserInternalData(request);
 
    return { result: result };
};