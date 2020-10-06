var inst = [];
var list_bairro = [];

var inst_filters = {};

var filterList = {};
var filterApplied = []; /* True sempre que qualquer filtro esteja ativo */

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

            for (var key in element.list[0]) {
                var newList = [];
                if (key != "nome" && key != "horario" && key != "link_map" && key != "numero" && key != "bairro" && key != "docs"){
                    if (!(key in inst_filters)) {
                        inst_filters[key.toLowerCase()] = newList;
                    }
                }
            }

            for (let j = 0; j < element.list.length; j++) {
                list_inst += 
                "<div class=\"local-ref\">"+
                    "<div class=\"local-ref-title\">"+ element.list[j].nome +"</div>"+
                    "<div class=\"local-ref-info\" name=\""+element.list[j].nome+"\"></div>"+
                    "<a href=\"" + element.list[j].link_map + "\" target=\"_blank\"><div class=\"local-ref-map\"></div> </a>"+
                "</div>";

                for (var key in inst_filters) {
                    console.log(element.list[j][key] + " | " + inst_filters[key].indexOf(element.list[j][key]));
                    if (inst_filters[key].indexOf(element.list[j][key].toLowerCase()) == -1) {
                        inst_filters[key].push(element.list[j][key].toLowerCase());
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

        for (var key in inst_filters) {
            inst_filters[key].push("tudo");
        }
        console.log(inst_filters);
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

function createFilterList() {
    for (var key in inst_filters) {
        var newFilterSubList = [];

        for (let i = 0; i < inst_filters[key].length - 1; i++) {
            newFilterSubList.push(false);
        }

        newFilterSubList.push(true); /* Opção para Todos */

        filterList[key] = newFilterSubList;
    }

    console.log(filterList);

    for (var key in filterList) {
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
    for (var key in inst_filters) {
        for (let i = 0; i < inst_filters[key].length; i++) {
            $("#filterType-" + key).append(
                "<div class=\"filter-option\" type=\"" + key + "\" value=\"" + inst_filters[key][i] + "\">" + 
                    inst_filters[key][i].substring(0,1).toUpperCase() + inst_filters[key][i].substring(1) +
                "</div>" +
                "<div class=\"filter-toggle\"><div class=\"filter-toggle-icon\"></div></div>"
            );
        }
    }
}

function filterSelect() {
    var filterType = $(this).prev(".filter-option").attr("type");
    var filter = $(this).prev(".filter-option").attr("value");
    var filterIndex = inst_filters[filterType].indexOf(filter);
    console.log(filterIndex);

    var filterTypeSize = filterList[filterType].length - 1; /* Exclui o último, que equivale a opção Tudo */
    var filterTypeCount = 0;

    if (filterList[filterType][filterIndex] == true) {
        filterList[filterType][filterIndex] = false;
    } else {
        filterList[filterType][filterIndex] = true;
    }
    
    if (filterIndex == filterTypeSize) {
        for (var i = 0; i < filterTypeSize; i++) {
            filterList[filterType][i] = false;
        }
    
        showAllElements();
        checkBairroList();
    }
    else {
        for (var i = 0; i < filterTypeSize; i++) {
            if (filterList[filterType][i] == true) {
                filterTypeCount++;
            }
        }

        if (filterTypeCount == filterTypeSize) {
            for (var i = 0; i < filterTypeSize; i++) {
                filterList[filterType][i] = false;
            }
        
            filterList[filterType][filterTypeSize] = true;
            showAllElements();

            checkBairroList();
        }
        else {
            
            filterList[filterType][filterTypeSize] = false;
            if (filterApplied != true) {
                hideAllElements();

                for (let i = 0; i < inst.length; i++) {
                    var element = inst[i];

                    if (element[filterType].toLowerCase() == inst_filters[filterType][filterIndex]) {
                        showElement(element.nome);
                    }
                }
            }
            else {
                for (let i = 0; i < inst.length; i++) {
                    var element = inst[i];

                    if (element[filterType].toLowerCase() != inst_filters[filterType][filterIndex]) {
                        hideElement(element.nome);
                    }
                }
            }
        
            checkBairroList();
        }
        console.log(filterList[ filterType ]);
    }
};

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

function hideElement(nome) {
    $(".local-ref").each(function(){
        if ($(this).find(".local-ref-info").attr("name") == nome)
        {
            $(this).css("display", "none");
            $(this).attr("state", "hidden");
        }
    });    
};

function showElement(nome) {
    $(".local-ref").each(function(){
        if ($(this).find(".local-ref-info").attr("name") == nome)
        {
            $(this).css("display", "flex");
        }
    }); 
};

function hideAllElements() {
    $(".local-ref").each(function(){
        $(this).css("display", "none");
    });  
    
    filterApplied = true;
}

function showAllElements() {
    $(".local-ref").each(function(){
        $(this).css("display", "flex");
    });  
    
    filterApplied = false;
}

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
                "<a href=\"tel:" + element.numero + "\"><button class=\"call\"></button></a>"+
            "</div>"+
            "<div class=\"documentacao\">"+
                "<p class=\"doc-title\">Documentação</p>"+
                "<p class=\"doc-text\">"+element.docs+"</p>"+
            "</div>"+
            "<div class=\"mapa-section\">"+
                "<p>Ver no mapa</p>"+
                "<a href=\"" + element.link_map + "\" target=\"_blank\"><button class=\"open-map\">mapa</button></a>"+
            "</div>"+
        "</div>"
    );
}