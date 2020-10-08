var inst = [];
var list_bairro = [];

var numFilters = 0;

var inst_filters_keys = {}; /* Lista de características passiveis de filtro (key) e um boolean se está ativo */
var inst_filters_options = {} /* Lista de características passiveis de filtro (key) e as opções */

var filterList = {}; /* Lista de características passiveis de filtro (key) e suas opções (value) em boolean */
var filterApplied = {}; /* True sempre que qualquer filtro de um tipo esteja ativo */

$.get("data.json",
    function (data) {
        /**transforma o arquivo .json em um array */
        for(let i = 0; i < data.length; i++){
            inst.push(data[i]);
        }
        
        /**organiza o array de instituicoes numa lista por bairros
         * Teste de cada instituicao pra ver se ja existe uma lista pro seu bairro
         * Caso haja ela e adicionada nessa lista, senao e criada uma nova lista
         */
        let match = false; //var para o controle de checagem
        let matchNum = null;
        for(let i = 0; i < inst.length; i++){
            for (let j = 0; j < list_bairro.length; j++) {
                if (list_bairro[j].bairro == inst[i].bairro) {
                    match = true;
                    matchNum = j;
                    break;
                }
            }
            if(match){
                match = false;
                list_bairro[matchNum].list.push(inst[i]);
            }else{
                /**ESTRUTURA
                 * [{
                 *      bairro : "nome do bairro",
                 *      list : [
                 *          {instituicao 01},
                 *          {instituicao 02},
                 *          etc...
                 *      ]
                 * },
                 * {
                 *    bairro : "nome do outro bairro",
                 *      list : [
                 *          {instituicao 01},
                 *          {instituicao 02},
                 *          etc...
                 *},
                 *
                 * etc...
                 *        
                 *}]
                 */
                list_bairro.push({bairro : inst[i].bairro, list : [inst[i]]});
            }
        }

        for (let i = 0; i < list_bairro.length; i++) {
            const element = list_bairro[i];
            
            let list_inst = "";            
            
            for (let j = 0; j < element.list.length; j++) {
                list_inst += 
                "<div class=\"local-ref\">"+
                    "<div class=\"local-ref-title\">"+ element.list[j].nome +"</div>"+
                    "<div class=\"local-ref-info\" name=\""+element.list[j].nome+"\"></div>"+
                    "<a href=\"" + element.list[j].link_map + "\" target=\"_blank\"><div class=\"local-ref-map\"></div> </a>"+
                "</div>";

                for (var key in element.list[j]){
                    if (key != "nome" && key != "horario" && key != "link_map" && key != "numero" && key != "bairro" && key != "docs"){
                        if ((key in inst_filters_keys) ==  false) {
                            inst_filters_keys[key] = false;
                            inst_filters_options[key] = [];
                        }
                        if (inst_filters_options[key].indexOf(element.list[j][key].toLowerCase()) == -1) {
                            inst_filters_options[key].push(element.list[j][key].toLowerCase());
                        }
                    }
                }
            }

            $('#bairro-list').append(
                "<div class=\"bairro-block\">"+
                    "<div class=\"bairro-header\">"+
                        "<div class=\"bairro-icon\"></div>"+
                        "<div class=\"bairro-title\">"+ element.bairro +"</div>"+
                        "<div class=\"bairro-arrow-button\"></div>"+
                    "</div>"+
                
                   " <div class=\"bairro-locais-list\">"+
                   list_inst+
                    "</div>"+
			    "</div>"
            );
            
        }
        for (let x = 0; x < inst.length; x++) {
            if(inst[x].horario == "24h"){
                console.log(inst[x]);
                generatePlantao(inst[x]);
            }
        }
        for (var i = 0; i < inst.length; i++) {
            var filters = {};

            for (key in inst_filters_keys) {
                var optionBoolList = [];

                for (var j = 0; j < inst_filters_options[key].length; j++) {
                    optionBoolList.push(false);
                }
                filters[key] = optionBoolList;
                inst_filters_keys[key] = optionBoolList;
            }

            inst[i]["filters"] = filters;
        }
        console.log(inst);
        console.log(inst_filters_keys);
        createFilterList();

        AddClickEvent();
    }
);


function AddClickEvent() {
    $(".bairro-header").each(function(){
        $(this).on("click", toggleBairroList);
    });

    $(".ajuda-header").each(function () {
        $(this).on("click", toggleAjudaList);
    });

    $(".local-ref-info").each(function(){
        $(this).on("click", openLocalInfo);
    });
    
    $("#close-local-block").on("click", closeLocalInfo);

    $("#filter-button").on("click", openFilterTab);
    $("#close-filter-tab").on("click", closeFilterTab);

    $(".filter-toggle").each(function(){
        $(this).on("click", filterSelect);
    });
}

function toggleBairroList(){
    if ($(this).hasClass("bairro-header-selected") == false) {
        var oldOpenBairro = $(".bairro-header-selected");
        oldOpenBairro.attr("open", "false");
        oldOpenBairro.next(".bairro-locais-list").css("display", "none");
        oldOpenBairro.removeClass("bairro-header-selected");

        $(this).attr("open", "true");
        $(this).addClass("bairro-header-selected");
    
        var list = $(this).next(".bairro-locais-list"); 
        list.css("display", "flex");
    }
    else {
        $(this).attr("open", "false");
        $(this).removeClass("bairro-header-selected");
    
        var list = $(this).next(".bairro-locais-list"); 
        list.css("display", "none");
    }
}

function toggleAjudaList() {
    if ($(this).hasClass("ajuda-header-selected") == false) {
        var oldOpenBairro = $(".ajuda-header-selected");
        oldOpenBairro.attr("open", "false");
        oldOpenBairro.next(".ajuda-dicas-list").css("display", "none");
        oldOpenBairro.removeClass("ajuda-header-selected");

        $(this).attr("open", "true");
        $(this).addClass("ajuda-header-selected");
    
        var list = $(this).next(".ajuda-dicas-list"); 
        list.css("display", "flex");
    }
    else {
        $(this).attr("open", "false");
        $(this).removeClass("ajuda-header-selected");
    
        var list = $(this).next(".ajuda-dicas-list"); 
        list.css("display", "none");
    }
}

// Open Filter Tab
function openFilterTab() {
    var filterTabBg = $("#filter-tab-bg")
    var filterTab = $("#filter-tab");

    filterTabBg.css("display", "block");
    filterTabBg.css("animation-name", "showBg");
    filterTab.css("animation-name", "openFilterTab");
};

// Close Filter Tab
function closeFilterTab() {
    var filterTabBg = $("#filter-tab-bg")
    var filterTab = $("#filter-tab");
    
    filterTabBg.css("animation-name", "hideBg");
    filterTab.css("animation-name", "closeFilterTab");
    setTimeout(function(){ filterTabBg.css("display", "none"); }, 500);
};

/* Cria a lista de Filtros, tanto o Dicionário que guarda os booleans, quando o html em si */
function createFilterList() {
    /* Tipos de filtro (interface) */
    for (var key in inst_filters_options) {
        switch(key) {
            case "preco":                                     /* Preços */
                $("#filters-list").append(
                    "<div class=\"filters\" id=\"filterType-" + key + "\">" + 
                        "<p class=\"filters-title\">Preços</p>" +
                    "</div>"
                );
                
                break;

            case "atendimento":                                     /* Atendimento */
                $("#filters-list").append(
                    "<div class=\"filters\" id=\"filterType-" + key + "\">" + 
                        "<p class=\"filters-title\">Atendimento</p>" +
                    "</div>"
                );
                
                break;
        }
    }
    /* Opções de cada tipo de filtro (interface) */
    for (var key in inst_filters_options) {
        for (let i = 0; i < inst_filters_options[key].length; i++) {
            $("#filterType-" + key).append(
                "<div class=\"filter-option\" type=\"" + key + "\" value=\"" + inst_filters_options[key][i] + "\">" + 
                    inst_filters_options[key][i].substring(0,1).toUpperCase() + inst_filters_options[key][i].substring(1) +
                "</div>"                
            );
            
            $("#filterType-" + key).append(    
                "<div class=\"filter-toggle\"><div class=\"filter-toggle-icon\"></div></div>"
            );
        }
    }
}

function filterSelect() {
    var filterType = $(this).prev(".filter-option").attr("type");
    var filter = $(this).prev(".filter-option").attr("value");
    var filterIndex = inst_filters_options[filterType].indexOf(filter);

    if ($(this).hasClass("filter-toggle-active") == false){
        for (let i = 0; i < inst.length; i++) {
            var local = inst[i];

            if (local[filterType].toLowerCase() != filter) {
                local["filters"][filterType][filterIndex] = true;
            }

            changeVisibility(local);
        }
    }
    else {
        for (let i = 0; i < inst.length; i++) {
            var local = inst[i];

            if (local[filterType].toLowerCase() != filter) {
                local["filters"][filterType][filterIndex] = false;
            }

            changeVisibility(local);
        }
    }
    
    console.log(inst);
    console.log(inst_filters_keys);
    $(this).toggleClass("filter-toggle-active");
    checkBairroList();
};

function changeVisibility(local) {
    $(".local-ref").each(function(){
        if ($(this).find(".local-ref-info").attr("name") == local.nome)
        {
            var checkIfHasFilter = false;

            // Confere se há pelo menos um filtro aplicado neste local
            for (var filterType in local.filters){
                for (var i = 0; i < filterType.length; i++) {
                    if (local.filters[filterType][i] == true) {
                        checkIfHasFilter = true;
                    }
                }
            }

            // Caso haja, esconde o local
            if (checkIfHasFilter == true){
                $(this).css("display", "none");
            }
            // Caso não haja, mostra o local
            else {
                $(this).css("display", "flex");
            }
            
        }
    }); 
}

/* SEM USO NO MOMENTO */
function reApplyFilter(){
    for (var key in filterList) {
        for (let i = 0; i < filterList[key].length; i++) {
            if (filterList[key][i] == true) {
                for (let j = 0; j < inst.length; j++) {
                    var element = inst[j];

                    if (element[filterType].toLowerCase() != inst_filters[filterType][filterIndex]) {
                        hideElement(element.nome);
                    }
                }
            }
        }
    }
}

/* Esconde um elemento */
function hideElement(nome, filter) {
    $(".local-ref").each(function(){
        if ($(this).find(".local-ref-info").attr("name") == nome)
        {
            $(this).css("display", "none");
        }
    });    
};

/* Mostra um elemento */
function showElement(nome, filter) {
    $(".local-ref").each(function(){
        if ($(this).find(".local-ref-info").attr("name") == nome)
        {
            $(this).css("display", "flex");
        }
    }); 
};

/* Esconde todos os elementos */
function hideAllElements() {
    $(".local-ref").each(function(){
        $(this).css("display", "none");
    });  
}

/* Mostra todos os elementos que foram escondidos por um tipo de filtro */
function showAllElementsByFilter(filterType) {
    $(".local-ref").each(function(){
        for (var filter in inst_filters[filterType])
        {
            if ($(this).attr("filteredBy") == filter){ 
                $(this).css("display", "flex");
                $(this).attr("filteredBy", null);
            }
        }
    });  
    
    checkFilterApplied();
}

/* Mostra todos os elementos */
function showAllElements() {
    $(".local-ref").each(function(){
        for (var filter in inst_filters[filterType])
        {
            if ($(this).attr("filteredBy") == filter){ 
                $(this).css("display", "flex");
                $(this).attr("filteredBy", null);
            }
        }
    });  
    
    checkFilterApplied();
}

/* Checa se algum filtro ainda está aplicado */
function checkFilterApplied() {
    var filterListTemp = [];

    for (var filterType in inst_filters){
        /* Se o único true na array for o equivalente a opção Tudo, salva true */
        if (filterList[filterType].indexOf(true) == filterList[filterType].length - 1) {
            filterListTemp.push(true);
        }
        else {
            filterListTemp.push(false);
        }
    }

    /* Se houver apenas true na lista temporária, significa que não há filtro aplicado */
    if (filterListTemp.indexOf(false) != -1) {
        filterApplied = false;
    }
    else {
        filterApplied = true;
    }
}

/* Chega para ver se uma lista de um bairro foi completamente escondida, escondendo tbm o bairro em si */
function checkBairroList(){
    $(".bairro-locais-list").each(function(){
        var locaisEscondidos = 0;

        var locais = $(this).find(".local-ref").length;

        for (let i = 1; i <= locais; i++) {
            if ($(this).find(".local-ref:nth-child(" + i + ")").css("display") == "none") {
                locaisEscondidos++;
            }
        }

        if (locaisEscondidos == locais) {
            $(this).parent().css("display","none");
        }
        else {
            $(this).parent().css("display","block");
        }
    });
}

function openLocalInfo(elem) {
    console.log($(elem.target).attr('name'));
    separaInfo($(elem.target).attr('name'))
    var localInfoBg = $("#local-block-bg")
    var localInfo = $("#local-block");

    localInfoBg.css("display", "block") ;
    localInfoBg.css("animation-name","showBg") ;
    localInfo.css("animation-name","openLocalInfo");
}

function separaInfo(nm) {
    for (let i = 0; i < inst.length; i++) {
        const element = inst[i];
        
        if(nm == element.nome){
            console.log(element);
            
            $("#local-title").html(element.nome);

            var localContent = "";

            /* Conteúdo em Tags */

            localContent += "<div id=\"local-tags\">";

            if (element.hasOwnProperty('preco'))
                localContent += "<div class=\"local-tag\">" + element.preco.substring(0,1).toUpperCase() + element.preco.substring(1) + "</div>";

            if (element.hasOwnProperty('atendimento'))
                localContent += "<div class=\"local-tag\">" + element.atendimento.substring(0,1).toUpperCase() + element.atendimento.substring(1) + "</div>";

            localContent += "</div>";

            /* Conteúdo em bloco */

            if (element.hasOwnProperty('horario'))
                localContent += "<div><div class=\"local-info-title\">Horário</div><div class=\"local-info-desc\">" + element.horario + "</div></div>";

            if (element.hasOwnProperty('numero'))
            {
                var ddd = element.numero.substring(0,2);
                var numeroStart = "";
                var numeroEnd = "";
                
                /* Número móvel */
                if (element.numero.length == 11) {
                    numeroStart = element.numero.substring(2, 7);
                    numeroEnd = element.numero.substring(7);
                }
                /* Número fixo */
                else if (element.numero.length == 10) {
                    numeroStart = element.numero.substring(2, 6);
                    numeroEnd = element.numero.substring(6);
                }

                localContent += "<div><div class=\"local-info-title\">Número</div><div class=\"local-info-desc\">(" + ddd + ") " + numeroStart + "-" + numeroEnd + "</div></div>";

                $("#local-number").attr("href", "tel:" + element.numero);
            }

            /* Botoes */
            $("#local-map").attr("href", element.link_map);

            if (element.hasOwnProperty('endereco'))
                localContent += "<div><div class=\"local-info-title\">Endereço</div><div class=\"local-info-desc\">" + element.endereco + "</div></div>";
            
            $("#local-content").html(localContent);
            

        }
    }
}

function closeLocalInfo() {
    var localInfoBg = $("#local-block-bg")
    var localInfo = $("#local-block");

    localInfoBg.css("animation-name","hideBg") ;
    localInfo.css("animation-name","closeLocalInfo");
    setTimeout(function(){ localInfoBg.css("display", "none"); }, 500);
}

function generatePlantao(element) {
    console.log("chamado");
    $(".plantao-container").append(
        "<div class=\"plantao-block\">"+
            "<div class=\"plantao-header\">"+
                "<p>"+ element.nome+"</p>"+
                "<a href=\"tel:" + element.numero + "\" class=\"call-container\";><div class=\"call\"></div></a>"+
            "</div>"+
            "<div class=\"documentacao\">"+
                "<p class=\"doc-title\">Documentação</p>"+
                "<p class=\"doc-text\">"+element.docs+"</p>"+
            "</div>"+
            "<div class=\"mapa-section\">"+
                "<p>Ver no mapa</p>"+
                "<a href=\"" + element.link_map + "\" target=\"_blank\" class=\"open-map-container\";><button class=\"open-map\">mapa</button></a>"+
            "</div>"+
        "</div>"
    );
}