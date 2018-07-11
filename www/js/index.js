// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function main(container)
{
    const payload = {
        "version": "1.0.0",
        "entry": "entry",
        "name": "reauth",
        "complete": "success",
        "states": {
            "entry": {
                "module": "Entry",
                "map": {
                    "found": "username",
                    "not_found": "username"
                }
            },
            "username": {
                "module": "Username",
                "map": {
                    "found": "password_or_idp",
                    "not_found": "password"
                }
            },
            "password_or_idp": {
                "module": "PasswordOrIdp",
                "map": {
                    "found": "password",
                    "not_found": "user_idp"
                }
            },
            "password": {
                "module": "Password",
                "map": {
                    "found": "requires_mfa",
                    "not_found": "password"
                }
            },
            "mfa": {
                "module": "Mfa",
                "map": {
                    "found": "mfa_login",
                    "not_found": "success"
                }
            },
            "mfa_login": {
                "module": "MfaLogin",
                "map": {
                    "found": "success",
                    "not_found": "username"
                }
            },
            "requires_mfa": {
                "module": "RequiresMfa",
                "map": {
                    "found": "mfa",
                    "not_found": "success"
                }
            },
            "user_idp": {
                "module": "UserIdp",
                "map": {
                    "found": "access_service",
                    "not_found": "username"
                }
            },
            "access_service": {
                "module": "AccessService",
                "map": {
                    "found": "success"
                }
            },
            "success": {
                "module": "ReauthSuccess"
            }
        }
    };


    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported())
    {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else
    {
        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);

        // Creates the graph inside the given container
        const graph = new mxGraph(container);

        // Enables rubberband selection
        new mxRubberband(graph);

       // graph.setEnabled(false);
        graph.setPanning(true);
        graph.setTooltips(true);
        graph.panningHandler.useLeftButtonForPanning = true;

        // Adds a highlight on the cell under the mousepointer
        new mxCellTracker(graph);

        // Creates a layout algorithm to be used
        // with the graph
        const layout = new mxFastOrganicLayout(graph);

        // Moves stuff wider apart than usual
        layout.forceConstant = 140;

        // Adds a button to execute the layout
        document.body.appendChild(mxUtils.button('Arrange',function(evt)
        {
            const parent = graph.getDefaultParent();
            layout.execute(parent);
        }));

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();

        const states = payload.states;
        let nodes = [];
        let edges = [];
        let vertex = {};
        for (let key in states) {
            // skip loop if the property is from prototype
            if (!payload.states.hasOwnProperty(key)) continue;
            nodes.push(key);
            const map = states[key].map;
            let edge = {};
            if(map) {
                edge["name"] = key;
                edge["found"] = map.found;
                edge["not_found"] = map.not_found;
                edges.push(edge);
            }
        }

        try
        {
            for (let key=0; key<nodes.length; key++) {
                let name = nodes[key];
                vertex[name] = graph.insertVertex(parent, null, name, 50, 50, 80, 70);
            }
            for (let key=0; key<edges.length; key++) {
                const e = graph.insertEdge(parent, null, "found", vertex[edges[key].name], vertex[edges[key].found]);
                const f = graph.insertEdge(parent, null, "not found", vertex[edges[key].name], vertex[edges[key].not_found]);
            }

            var parent = graph.getDefaultParent();
            // Executes the layout
            layout.execute(parent)
        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
};
