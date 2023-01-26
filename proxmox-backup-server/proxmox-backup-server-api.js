module.exports = function(RED) {
	var request = require("request");

	function ProxmoxBackupServerApiNode(config) {

		RED.nodes.createNode(this,config);
		this.path = config.path;
		this.method = config.method;
		this.payload = config.payload;
		this.server = RED.nodes.getNode(config.server);
		this.jar = request.jar();
		var node = this;

        node.server.register(this);

		node.on('input', function(msg) {
			if (node.server.auth) {
				var endpoint = "/api2/json";

				if (node.path || msg.path) {
					endpoint += "/" + (msg.path || node.path);
				}

				var requestOptions = node.setupOptions(endpoint, (msg.method || node.method), msg);
				node.callApi(requestOptions, msg, 3);
			}
		});

		node.setupOptions = function(endpoint, method, msg) {
			var options = { method: method,
				url: node.server.baseURL + endpoint,
				strictSSL: false,
				json: true,
				jar: node.jar,
			};

            // Set auth cookies
            var cookie = request.cookie("PBSAuthCookie=" + node.server.auth.ticket);
            node.jar.setCookie(cookie, node.server.baseURL);

            // Add payload & headers for write operations
            if (["PUT", "POST", "DELETE"].includes(method)) {

                if (msg.payload || node.payload) {
                    if (typeof msg.payload === 'object') {
                        options.form = msg.payload;
                    }
                    else if (node.payload !== ""){
                        try {
                            var payloadObject = JSON.parse(node.payload);
                            options.form = payloadObject;
                        } catch (e) {
                            node.error("Error parsing JSON payload:")
                            node.error(node.payload);
                        }
                    }
                }

                options.headers = {
                    'CSRFPreventionToken': node.server.auth.CSRFPreventionToken,
                    'cache-control': 'no-cache', 
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }

            // node.log(JSON.stringify(options));

            return options;
        }

        node.callApi = function(options, msg, ttl) {
            if (ttl <= 0) return;
            // node.log("Calling API with options:");
            // node.log(JSON.stringify(options));
			request(options, function (error, response, body) {
				if (response.statusCode === 200) {
					msg.payload = response.body.data;
					node.send(msg);
				} else if (response.statusCode === 401) {
                    node.server.authenticate().then(function(body) {
                        node.callApi(options, msg, ttl-1);
                    });
				} else {
					node.error(JSON.stringify(response), msg);
				}
			});
		}

		node.status({fill:"orange",shape:"ring",text:"unauthenticated"});

	}
	RED.nodes.registerType("proxmox-backup-server-api",ProxmoxBackupServerApiNode);
}

