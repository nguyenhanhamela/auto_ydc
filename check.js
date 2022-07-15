var array = [
    {
        "medium_area_id": "hokkaido",
        "rank_type": [
            {
                "hotel_id": "104551"
            },
            {
                "hotel_id": "142907"
            }
        ]
    },
    {
        "medium_area_id": "hokkaido",
        "rank_type": [
            {
                "hotel_id": "55432"
            },
            {
                "hotel_id": "145283"
            },
            {
                "hotel_id": "44108"
            },
            {
                "hotel_id": "39391"
            },
            {
                "hotel_id": "160884"
            },
            {
                "hotel_id": "18214"
            },
            {
                "hotel_id": "76776"
            },
            {
                "hotel_id": "54218"
            },
            {
                "hotel_id": "147783"
            },
            {
                "hotel_id": "19239"
            },
            {
                "hotel_id": "9585"
            },
            {
                "hotel_id": "142877"
            },
            {
                "hotel_id": "30893"
            },
            {
                "hotel_id": "27938"
            },
            {
                "hotel_id": "9616"
            },
            {
                "hotel_id": "28492"
            },
            {
                "hotel_id": "128564"
            },
            {
                "hotel_id": "173008"
            },
            {
                "hotel_id": "108152"
            },
            {
                "hotel_id": "180106"
            },
            {
                "hotel_id": "16077"
            },
            {
                "hotel_id": "167831"
            },
            {
                "hotel_id": "28941"
            },
            {
                "hotel_id": "4680"
            },
            {
                "hotel_id": "39277"
            },
            {
                "hotel_id": "44290"
            },
            {
                "hotel_id": "106181"
            },
            {
                "hotel_id": "106205"
            },
            {
                "hotel_id": "147826"
            },
            {
                "hotel_id": "9493"
            }
        ]
    },
    {
        "medium_area_id": "hokkaido",
        "rank_type": [
            {
                "hotel_id": "153293"
            },
            {
                "hotel_id": "559"
            },
            {
                "hotel_id": "172272"
            },
            {
                "hotel_id": "901"
            },
            {
                "hotel_id": "762"
            },
            {
                "hotel_id": "79255"
            },
            {
                "hotel_id": "163"
            },
            {
                "hotel_id": "109107"
            },
            {
                "hotel_id": "635"
            },
            {
                "hotel_id": "1131"
            },
            {
                "hotel_id": "79254"
            },
            {
                "hotel_id": "180441"
            },
            {
                "hotel_id": "70234"
            },
            {
                "hotel_id": "9515"
            },
            {
                "hotel_id": "625"
            },
            {
                "hotel_id": "137031"
            },
            {
                "hotel_id": "169"
            },
            {
                "hotel_id": "178218"
            },
            {
                "hotel_id": "761"
            },
            {
                "hotel_id": "179353"
            },
            {
                "hotel_id": "67259"
            },
            {
                "hotel_id": "68288"
            },
            {
                "hotel_id": "7523"
            },
            {
                "hotel_id": "165829"
            },
            {
                "hotel_id": "127"
            },
            {
                "hotel_id": "76941"
            },
            {
                "hotel_id": "179085"
            },
            {
                "hotel_id": "182301"
            },
            {
                "hotel_id": "145066"
            },
            {
                "hotel_id": "849"
            }
        ]
    },
    {
        "medium_area_id": "hokkaido",
        "rank_type": [
            {
                "hotel_id": "181475"
            },
            {
                "hotel_id": "181507"
            },
            {
                "hotel_id": "181664"
            },
            {
                "hotel_id": "181798"
            },
            {
                "hotel_id": "181979"
            },
            {
                "hotel_id": "182126"
            },
            {
                "hotel_id": "182127"
            },
            {
                "hotel_id": "182561"
            },
            {
                "hotel_id": "182718"
            },
            {
                "hotel_id": "182825"
            },
            {
                "hotel_id": "183366"
            },
            {
                "hotel_id": "183433"
            },
            {
                "hotel_id": "183582"
            },
            {
                "hotel_id": "183770"
            },
            {
                "hotel_id": "183892"
            },
            {
                "hotel_id": "184184"
            },
            {
                "hotel_id": "184189"
            },
            {
                "hotel_id": "184249"
            },
            {
                "hotel_id": "184449"
            },
            {
                "hotel_id": "41765"
            },
            {
                "hotel_id": "42047"
            },
            {
                "hotel_id": "138093"
            },
            {
                "hotel_id": "151261"
            },
            {
                "hotel_id": "168707"
            },
            {
                "hotel_id": "172164"
            },
            {
                "hotel_id": "177109"
            },
            {
                "hotel_id": "178583"
            }
        ]
    }
]
const mergedArray = [];
array.forEach((obj, index) => {
var newObj = {}
if(index > 0){
    if(mergedArray.length > 0){
    for(let i=0; i<obj.rank_type.length;i++){
        mergedArray[0].rank_type.push(obj.rank_type[i]);
    }
    }
}else{
    newObj["medium_area_id"] = obj.medium_area_id ;
    newObj["rank_type"] =  obj.rank_type;
    mergedArray.push(newObj);
        }
})
console.log(mergedArray);