var inst = [];
var list_bairro = []

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
                "<button class=\"call\"></button>"+
            "</div>"+
            "<div class=\"documentacao\">"+
                "<p class=\"doc-title\">Documentação</p>"+
                "<p class=\"doc-text\">"+element.docs+"</p>"+
            "</div>"+
            "<div class=\"mapa-section\">"+
                "<p>Ver no mapa</p>"+
                "<button class=\"open-map\">mapa</button>"+
            "</div>"+
        "</div>"
    );
}