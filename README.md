# node-red-contrib-proxmox-backup-server
A Node-RED node for connecting to the Proxmox Backup Server API

## Node-RED Proxmox Backup Server
This is a Node-RED module to allow easy access to the Proxmox Backup Server API. 
This node requires that you have access to a running instance of Proxmox Backup Server and have an account with permissions to access the API.

Note that this module is copied based on the node-red-contrib-proxmox node already available for Proxmox Virtual Environment API and was updated to make use of the Proxmox Backup Server API.

### Nodes
This module exposes two nodes: a Proxmox Backup Server  configuration node, and a generic Proxmox Backup Server API node. The Proxmox Server configuration allows for configuration of Proxmox Backup Servers. The Proxmox Backup Server API node performs the action of calling the Proxmox Backup Server API and returning the result.

### Proxmox Backup Server API Node
Upon a trigger, this node will call the API path indicated. The results of the call will be set as the value of `msg.payload`
The folowing values can be set on the `msg` object and they will overwrite any manually entered settings:
- `msg.path`: The API path to query. List of available paths is available at the API documentation link below.
- `msg.method`: A method from the following list: GET, POST, PUT, DELETE. PUT and POST require additional information to be passed in the payload.
- `msg.payload`: Body of the message to be sent on POST & PUT requests. See API docs for proper values. 

See the [Proxmox Backup Server API Documentation](https://pbs.proxmox.com/docs/api-viewer/index.html) for further details.

Tested with Proxmox Backup Server version 2.3-2
