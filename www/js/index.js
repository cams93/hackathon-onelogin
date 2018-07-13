var modules = {};

// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function main(container)
{
    const payload = {
        "version": "1.0.0",
        "entry": "desktop",
        "name": "login",
        "complete": [ "success", "failure" ],
        "states": {
          "username": {
            "module": "Username",
            "map": {
              "found": "success",
              "not_found": "password"
            }
          },
          "user_idp": {
            "module": "UserIdp",
            "map": {
              "found": "access_service",
              "not_found": "username"
            }
          },
          "account_idp": {
            "module": "AccountIdp",
            "map": {
              "found": "access_service",
              "not_found": "username"
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
              "found": "user_state",
              "not_found": "password"
            }
          },
          "user_state": {
            "module": "UserState",
            "map": {
              "found": "requires_euba",
              "not_found": "failure"
            }
          },
          "requires_euba": {
            "module": "RequiresEuba",
            "map": {
              "found": "euba_risk",
              "not_found": "requires_mfa"
            }
          },
          "euba_risk": {
            "module": "EubaRisk",
            "map": {
              "found": "requires_mfa",
              "not_found": "pki"
            }
          },
          "prepare_set_password": {
            "module": "PrepareResetPassword",
            "map": {
              "found": "set_password",
              "not_found": "username"
            }
          },
          "set_password": {
            "module": "ResetPassword",
            "map": {
              "found": "success",
              "not_found": "prepare_set_password"
            }
          },
          "has_password_expired": {
            "module": "HasPasswordExpired",
            "map": {
              "found": "prepare_set_password",
              "not_found": "success"
            }
          },
          "failure": {
            "module": "Failure"
          },
          "success": {
            "module": "Success"
          },
          "mfa": {
            "module": "Mfa",
            "map": {
              "found": "mfa_login",
              "not_found": "mfa_register"
            }
          },
          "mfa_register": {
            "module": "MfaRegister",
            "map": {
              "found": "requires_terms",
              "not_found": "username"
            }
          },
          "mfa_login": {
            "module": "MfaLogin",
            "map": {
              "found": "requires_terms",
              "not_found": "username"
            }
          },
          "requires_terms": {
            "module": "RequiresTermsAndConditions",
            "map": {
              "found": "terms",
              "not_found": "has_password_expired"
            }
          },
          "terms": {
            "module": "TermsAndConditions",
            "map": {
              "found": "has_password_expired",
              "not_found": "failure"
            }
          },
          "requires_mfa": {
            "module": "RequiresMfa",
            "map": {
              "found": "mfa",
              "not_found": "pki"
            }
          },
          "desktop": {
            "module": "Desktop",
            "map": {
              "found": "desktop_login",
              "not_found": "username_or_idp"
            }
          },
          "username_or_idp": {
            "module": "UsernameOrIdp",
            "map": {
              "found": "username",
              "not_found": "account_idp"
            }
          },
          "desktop_login": {
            "module": "DesktopLogin",
            "map": {
              "found": "user_state_certificate",
              "not_found": "username_or_idp"
            }
          },
          "user_state_certificate": {
            "module": "UserState",
            "map": {
              "found": "access_service",
              "not_found": "failure"
            }
          },
          "pki": {
            "module": "Pki",
            "map": {
              "found": "pki_login",
              "not_found": "requires_terms"
            }
          },
          "access_service": {
            "module": "AccessService",
            "map": {
              "found": "requires_terms"
            }
          },
          "pki_login": {
            "module": "PkiLogin",
            "map": {
              "found": "access_service",
              "not_found": "username"
            }
          },
          "pki_install": {
            "module": "PkiInstall",
            "map": {
              "found": "requires_terms",
              "not_found": "pki_install"
            }
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

        // Adds a button to exporth graph into a payload
        document.body.appendChild(mxUtils.button('Payload', function()
        {
            var payload_result = generatePayload(graph.getModel(), payload);
            mxUtils.popup( JSON.stringify(payload_result), true);
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
            modules[key] = states[key].module;
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

function generatePayload(model, payload){
    delete payload["states"];
    
    var cells = model.cells;
    var states = {};
    for (let key in cells) {
        var cell = cells[key];
        if(!(cell instanceof mxCell && cell.value != undefined && cell.vertex==true)){
            continue;
        }
        states[cell.value] = {};
        states[cell.value].module = modules[cell.value];
        var map = {};
        var found = getEdge(cell, "found");
        if(found != null && found != undefined){
            map.found = found;
        }

        not_found = getEdge(cell, "not found");
        if(not_found != null && not_found != undefined){
            map.not_found = not_found;
        }

        if (Object.keys(map).length > 0){
            states[cell.value].map = map;
        }
    }
    payload.states = states;

    return payload;
}

function getEdge(cell, label){
    let edges = cell.edges;
    for(let i in edges){
        if(edges[i].value == label && edges[i].source.value == cell.value && edges[i].target!=null){
            return edges[i].target.value;
        }
    }
    return null;
}