'use strict';
define(function (require) {
    $(window).ready(onRender);
    var Postmonger = require('postmonger');
    var connection = new Postmonger.Session();
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', requestedInteractionHandler);
    connection.on('clickedNext', save);
    var customActivity = {};
    var accounts = [];
    var payload = {};
    var authTokens = {};
    var eventDefinitionKey = '';
    var brand = '';
    var whatsappAccount = '';
    var templateName = '';
    var phoneFieldName = '';
    var templateVariables = '';
    var extraVariables = '';
    var botRedirect = '';
    var botRedirectBlock = '';
    var masterState = '';
    async function loadCustomActivity() {
        loading(true);
        //let url = "/api/V1/WhatsappCustomActivity/get-custom-activity";
        //customActivity = await fetch(url).then(response => response.json());
		customActivity = await fetch('./accounts.json')
            .then(response => {
                console.log(response);
                if(!response.ok)
                    throw new Error('Reponse not ok'); 
                
                return response.json()
            });
    }
    function loading(isLoading) {
        if (isLoading) {
            $("#loading").css("display", "flex");
            $("#form").hide();
        } else {
            $("#loading").hide();
            $("#form").css("display", "flex");
        }
    }
    function toggleStatus(input) {
        var value = $(input).val();
        if (value !== '')
            toggleValid(input);
        else            toggleInvalid(input);
    }
    function toggleValid(input) {
        $(input).removeClass("is-invalid").addClass("is-valid");
        $(input).parent().find("small").hide();
    }
    function toggleInvalid(input) {
        $(input).removeClass("is-valid").addClass("is-invalid");
        $(input).parent().find("small").show();
    }
    function toggleUnset(input) {
        $(input).removeClass("is-invalid").removeClass("is-valid");
        $(input).parent().find("small").hide();
    }
    function loadAccountSelector(brand) {
        $("#whatsappAccount")
            .empty()
            .append($('<option>', {
                value: "",
                text: "Conta de envio (Router)"            }));
        if (brand != "") {
            let custom = customActivity.filter(f => f.brandId == brand)[0];
            if (custom) {
                accounts = custom.accounts;
                for (var account of accounts) {
                    $("#whatsappAccount")
                        .append($('<option>', {
                            value: account.id,
                            text: account.name                        }));
                }
            }
        }
        $("#whatsappAccount").trigger("change");
    }
    function lockForm() {
        var valueLogo = $("#brand").val();
        if (valueLogo == "") {
            toggleUnset($("#templateName").attr("disabled", true));
            toggleUnset($("#whatsappAccount").attr("disabled", true));
            toggleUnset($("#phoneFieldName").attr("disabled", true));
            toggleUnset($("#templateVariables").attr("disabled", true));
            toggleUnset($("#extraVariables").attr("disabled", true));
            toggleUnset($("#botRedirect").attr("disabled", true));
            toggleUnset($("#botRedirectBlock").attr("disabled", true));
            toggleUnset($("#masterState").attr("disabled", true));
        } else {
            toggleUnset($("#templateName").removeAttr("disabled"));
            toggleUnset($("#whatsappAccount").removeAttr("disabled"));
            toggleUnset($("#phoneFieldName").removeAttr("disabled"));
            toggleUnset($("#templateVariables").removeAttr("disabled"));
            toggleUnset($("#extraVariables").removeAttr("disabled"));
            toggleUnset($("#botRedirect").removeAttr("disabled"));
            toggleUnset($("#botRedirectBlock").removeAttr("disabled"));
            toggleUnset($("#masterState").removeAttr("disabled"));
        }
    }
    function brandChange(evt) {
        let value = $(evt.currentTarget).val();
        loadAccountSelector(value);
        lockForm();
        if (value == "") {
            $("#logo").attr("src", "images/whatsapp.png");
        }
        if (value == "3")
            $("#logo").attr("src", "images/logo-xp.png");
        if (value == "386")
            $("#logo").attr("src", "images/logo-rico.png");
        if (value == "308")
            $("#logo").attr("src", "images/logo-clear.png");
    }
    function whatsappAccountChange(evt) {
        toggleStatus(evt.currentTarget);
        var value = $(evt.currentTarget).val();
        formIsValid();
    }
    function templateNameChange(evt) {
        toggleStatus(evt.currentTarget);
        formIsValid();
    }
    function phoneFieldNameChange(evt) {
        toggleStatus(evt.currentTarget);
        formIsValid();
    }
    function templateVariablesChange(evt) {
        toggleStatus(evt.currentTarget);
        formIsValid();
    }
    function botRedirectChange(evt) {
        toggleStatus(evt.currentTarget);
        formIsValid();
    }
    function botRedirectBlockChange(evt) {
        toggleStatus(evt.currentTarget);
        formIsValid();
    }
    function masterStateChange(evt) {
        toggleStatus(evt.currentTarget);
        formIsValid();
    }
    function formIsValid() {
        var isValid = $("#whatsappAccount").val() !== ''            && $("#templateName").val() !== ''            && $("#phoneFieldName").val() !== ''            && $("#templateVariables").val() !== ''            && $("#botRedirect").val() !== ''            && $("#botRedirectBlock").val() !== ''            && $("#masterState").val() !== '';
        document.getElementById('btnEnable').disabled = !isValid;
        if (isValid) {
            $('#btnEnable').removeClass("disabled");
        }
        else {
            $('#btnEnable').addClass("disabled");
        }
        return isValid;
    }
    function initialize(data) {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');
        if (data) {
            payload = data;
        }
        var hasInArguments = Boolean(
            payload["arguments"] &&            payload["arguments"].execute &&            payload["arguments"].execute.inArguments &&            payload["arguments"].execute.inArguments.length > 0        );
        var inArguments = hasInArguments            ? payload["arguments"].execute.inArguments[0]
            : {};
        if (!hasInArguments) {
            payload.arguments = {};
            payload.arguments.execute = {};
            payload.arguments.execute.inArguments = [];
        }
        brand = inArguments.brand;
        whatsappAccount = inArguments.whatsappAccount;
        templateName = inArguments.templateName;
        phoneFieldName = inArguments.phoneFieldName;
        templateVariables = inArguments.templateVariables;
        extraVariables = inArguments.extraVariables;
        botRedirect = inArguments.botRedirect;
        botRedirectBlock = inArguments.botRedirectBlock;
        masterState = inArguments.masterState;
        if (brandId && whatsappAccount && templateName && phoneFieldName && templateVariables && botRedirect && botRedirectBlock && masterState) {
            $("#brand").val(brand);
            $("#whatsappAccount").val(whatsappAccount);
            $("#templateName").val(templateName);
            $("#phoneFieldName").val(phoneFieldName);
            $("#templateVariables").val(templateVariables);
            $("#extraVariables").val(extraVariables);
            $("#botRedirect").val(botRedirect);
            $("#botRedirectBlock").val(botRedirectBlock);
            $("#masterState").val(masterState);
            $("#btnEnable").hide();
            $("#btnDisable").show();
        }
    }
    function onRender() {
        $("#brand").on("change", brandChange);
        $("#whatsappAccount").on("change", whatsappAccountChange);
        $("#templateName").on("change", templateNameChange);
        $("#phoneFieldName").on("change", phoneFieldNameChange);
        $("#templateVariables").on("change", templateVariablesChange);
        $("#botRedirect").on("change", botRedirectChange);
        $("#botRedirectBlock").on("change", botRedirectBlockChange);
        $("#masterState").on('change', masterStateChange);
        $('#btnEnable').click(function () {
            brand = $("#brand").val();
            whatsappAccount = $("#whatsappAccount").val();
            templateName = $("#templateName").val();
            phoneFieldName = $("#phoneFieldName").val();
            templateVariables = $("#templateVariables").val();
            extraVariables = $("#extraVariables").val();
            botRedirect = $("#botRedirect").val();
            botRedirectBlock = $("#botRedirectBlock").val();
            masterState = $("#masterState").val();
            $(this).hide();
            $("#btnDisable").show();
        });
        $("#btnDisable").click(function () {
            brand = $("#brand").val("").trigger("change");
            whatsappAccount = $("#whatsappAccount").val("").trigger("change");
            templateName = $("#templateName").val("").trigger("change");
            phoneFieldName = $("#phoneFieldName").val("").trigger("change");
            templateVariables = $("#templateVariables").val("").trigger("change");
            extraVariables = $("#extraVariables").val("").trigger("change");
            botRedirect = $("#botRedirect").val("").trigger("change");
            botRedirectBlock = $("#botRedirectBlock").val("").trigger("change");
            masterState = $("#masterState").val("").trigger("change");
            $(this).hide();
            $("#btnEnable").show();
            $("#btnEnable").attr("disabled", true);
            $('#btnEnable').addClass("disabled");
        });
        loadCustomActivity()
            .then(() => loading(false));
        lockForm();
    }
    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }
    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }
    function requestedInteractionHandler(settings) {
        try {
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
            document.getElementById('select-entryevent-defkey').value = eventDefinitionKey;
        } catch (err) {
            console.error(err);
        }
    }
    function save() {
        if (templateVariables.endsWith(";"))
            templateVariables = templateVariables.substr(0, templateVariables.length - 1);
        if (extraVariables.endsWith(";"))
            extraVariables = extraVariables.substr(0, extraVariables.length - 1);
        let templateVarablesObj = {};
        let templateVariablesList = templateVariables.split(";");
        if (templateVariables !== "" && templateVariablesList.length > 0)
            for (var temp of templateVariablesList) {
                let tempList = temp.split(":");
                templateVarablesObj[tempList[0].trim()] = `{{Event.${eventDefinitionKey}.\"${tempList[1].trim()}\"}}`;
            }
        let extraVariablesObj = {};
        let extraVariablesList = extraVariables.split(";");
        if (extraVariables !== "" && extraVariablesList.length > 0)
            for (var temp of extraVariablesList) {
                let tempList = temp.split(":");
                extraVariablesObj[tempList[0].trim()] = `{{Event.${eventDefinitionKey}.\"${tempList[1].trim()}\"}}`;
            }
        let isValid = formIsValid();
        if (isValid) {
            payload.arguments.execute.inArguments = [{
                "brand": brand,
                "whatsappAccount": whatsappAccount, 
                "templateName": templateName,
                "contactNumber": `{{Event.${eventDefinitionKey}.\"${phoneFieldName}\"}}`,
                "templateVariables": templateVarablesObj,
                "extraVariables": extraVariablesObj,
                "botRedirect": botRedirect,
                "botRedirectBlock": botRedirectBlock,
                "tokens": authTokens,
                "contactIdentifier": "{{Contact.Key}}"            }];
            payload['metaData'].isConfigured = true;
        }
        else            payload.arguments.execute.inArguments = [];
        console.log('payload', JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }
});