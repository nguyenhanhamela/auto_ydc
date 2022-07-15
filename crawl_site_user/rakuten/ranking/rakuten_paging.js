// 'use strict';

const fs = require('fs');

const axios = require('axios');
const playwright = require('playwright');
const cheerio = require('cheerio');
const useHeadless = true; // "true" to use playwright
const maxVisits = 1000; // Arbitrary number for the maximum of links visited
const visited = new Set();
const allHotels = [];
const allData = {}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const rakutenUrl = [
    "https://travel.rakuten.co.jp/yado/hokkaido/hidaka.html/",
    "https://travel.rakuten.co.jp/yado/aomori/aomori.html/",
    "https://travel.rakuten.co.jp/yado/hokkaido/sapporo.html"
    // "https://travel.rakuten.co.jp/yado/hokkaido/jozankei.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/noboribetsu.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/abashiri.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/wakkanai.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/obihiro.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/furano.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/asahikawa.html/",
    // "https://travel.rakuten.co.jp/yado/aomori/tsugaru.html/",
    // "https://travel.rakuten.co.jp/yado/aomori/ntsugaru.html/",
    // "https://travel.rakuten.co.jp/yado/aomori/hirosaki.html/",
    // "https://travel.rakuten.co.jp/yado/aomori/towadako.html/",
    // "https://travel.rakuten.co.jp/yado/aomori/hachinohe.html/",
    // "https://travel.rakuten.co.jp/yado/aomori/shimokita.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/shizukuishi.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/appi.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/kuji.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/ofunato.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/kitakami.html/",
    // "https://travel.rakuten.co.jp/yado/miyagi/sendai.html/",
    // "https://travel.rakuten.co.jp/yado/miyagi/akiu.html/",
    // "https://travel.rakuten.co.jp/yado/miyagi/naruko.html/",
    // "https://travel.rakuten.co.jp/yado/miyagi/matsushima.html/",
    // "https://travel.rakuten.co.jp/yado/miyagi/shiroishi.html/",
    // "https://travel.rakuten.co.jp/yado/akita/akita.html/",
    // "https://travel.rakuten.co.jp/yado/akita/noshiro.html/",
    // "https://travel.rakuten.co.jp/yado/akita/odate.html/",
    // "https://travel.rakuten.co.jp/yado/akita/tazawa.html/",
    // "https://travel.rakuten.co.jp/yado/akita/yuzawa.html/",
    // "https://travel.rakuten.co.jp/yado/akita/honjo.html/",
    // "https://travel.rakuten.co.jp/yado/yamagata/yamagata.html/",
    // "https://travel.rakuten.co.jp/yado/yamagata/sagae.html/",
    // "https://travel.rakuten.co.jp/yado/yamagata/mogami.html/",
    // "https://travel.rakuten.co.jp/yado/yamagata/shonai.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/fukushima.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/aizu.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/bandai.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/urabandai.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/koriyama.html/",
    // "https://travel.rakuten.co.jp/yado/oita/usuki.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/kushiro.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/hamadori.html/",
    // "https://travel.rakuten.co.jp/yado/ibaraki/mito.html/",
    // "https://travel.rakuten.co.jp/yado/ibaraki/oarai.html/",
    // "https://travel.rakuten.co.jp/yado/ibaraki/hitachi.html/",
    // "https://travel.rakuten.co.jp/yado/ibaraki/tsukuba.html/",
    // "https://travel.rakuten.co.jp/yado/ibaraki/yuki.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/utsunomiya.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/nikko.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/kinugawa.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/nasu.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/shiobara.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/mashiko.html/",
    // "https://travel.rakuten.co.jp/yado/tochigi/koyama.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/maebashi.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/ikaho.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/manza.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/kusatsu.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/shimaonsen.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/oze.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/takasaki.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/fujioka.html/",
    // "https://travel.rakuten.co.jp/yado/saitama/saitama.html/",
    // "https://travel.rakuten.co.jp/yado/saitama/kasukabe.html/",
    // "https://travel.rakuten.co.jp/yado/saitama/kumagaya.html/",
    // "https://travel.rakuten.co.jp/yado/saitama/kawagoe.html/",
    // "https://travel.rakuten.co.jp/yado/saitama/tokorozawa.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/keiyo.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/kashiwa.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/narita.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/choshi.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/sotobo.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/tateyama.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/uchibo.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/okutama.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/nishi.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/ritou.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/oshima.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/kouzu.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/miyake.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/yokohama.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/kawasaki.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/hakone.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/odawara.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/yugawara.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/nansatsu.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/tokyo.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/niigata.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/kaetsu.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/kita.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/minami.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/yuzawa.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/joetsu.html/",
    // "https://travel.rakuten.co.jp/yado/niigata/sado.html/",
    // "https://travel.rakuten.co.jp/yado/toyama/toyama.html/",
    // "https://travel.rakuten.co.jp/yado/toyama/goto.html/",
    // "https://travel.rakuten.co.jp/yado/toyama/gosei.html/",
    // "https://travel.rakuten.co.jp/yado/ishikawa/kanazawa.html/",
    // "https://travel.rakuten.co.jp/yado/ishikawa/kaga.html/",
    // "https://travel.rakuten.co.jp/yado/ishikawa/noto.html/",
    // "https://travel.rakuten.co.jp/yado/ishikawa/nanao.html/",
    // "https://travel.rakuten.co.jp/yado/fukui/fukui.html/",
    // "https://travel.rakuten.co.jp/yado/fukui/awara.html/",
    // "https://travel.rakuten.co.jp/yado/fukui/katsuyama.html/",
    // "https://travel.rakuten.co.jp/yado/fukui/echizen.html/",
    // "https://travel.rakuten.co.jp/yado/fukui/tsuruga.html/",
    // "https://travel.rakuten.co.jp/yado/fukui/obama.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/kofu.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/yamanashi.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/otsuki.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/yamanakako.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/kawaguchiko.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/minobu.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/nirasaki.html/",
    // "https://travel.rakuten.co.jp/yado/yamanashi/kiyosato.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/nagano.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/nozawa.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/shiga.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/ueda.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/chikuma.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/sugadaira.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/karui.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/yatsu.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/kirigamine.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/suwa.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/ina.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/kiso.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/matsumo.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/kamiko.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/hotaka.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/hakuba.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/gifu.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/kamitakara.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/gujo.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/shirakawago.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/ogaki.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/shizuoka.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/atami.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/ito.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/izukogen.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/higashi.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/shimoda.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/nishi.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/naka.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/fuji.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/numazu.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/hamamatsu.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/kikugawa.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/nagoyashi.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/mikawawan.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/okumikawa.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/mikawa.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/owari.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/chita.html/",
    // "https://travel.rakuten.co.jp/yado/aichi/minamichita.html/",
    // "https://travel.rakuten.co.jp/yado/mie/tsu.html/",
    // "https://travel.rakuten.co.jp/yado/mie/yunoyama.html/",
    // "https://travel.rakuten.co.jp/yado/mie/iga.html/",
    // "https://travel.rakuten.co.jp/yado/mie/matsusaka.html/",
    // "https://travel.rakuten.co.jp/yado/mie/ise.html/",
    // "https://travel.rakuten.co.jp/yado/mie/toba.html/",
    // "https://travel.rakuten.co.jp/yado/mie/kumano.html/",
    // "https://travel.rakuten.co.jp/yado/shiga/ootsu.html/",
    // "https://travel.rakuten.co.jp/yado/shiga/kosei.html/",
    // "https://travel.rakuten.co.jp/yado/shiga/kohoku.html/",
    // "https://travel.rakuten.co.jp/yado/shiga/kotou.html/",
    // "https://travel.rakuten.co.jp/yado/shiga/shigaraki.html/",
    // "https://travel.rakuten.co.jp/yado/kyoto/shi.html/",
    // "https://travel.rakuten.co.jp/yado/kyoto/nannbu.html/",
    // "https://travel.rakuten.co.jp/yado/kyoto/yunohana.html/",
    // "https://travel.rakuten.co.jp/yado/kyoto/fukuchiyama.html/",
    // "https://travel.rakuten.co.jp/yado/kyoto/hokubu.html/",
    // "https://travel.rakuten.co.jp/yado/osaka/shi.html/",
    // "https://travel.rakuten.co.jp/yado/osaka/hokubu.html/",
    // "https://travel.rakuten.co.jp/yado/osaka/toubu.html/",
    // "https://travel.rakuten.co.jp/yado/osaka/nantou.html/",
    // "https://travel.rakuten.co.jp/yado/osaka/nanbu.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/kobe.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/nantou.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/minamichu.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/nannansei.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/awaji.html/",
    // "https://travel.rakuten.co.jp/yado/nara/nara.html/",
    // "https://travel.rakuten.co.jp/yado/nara/hokubu.html/",
    // "https://travel.rakuten.co.jp/yado/nara/nanbu.html/",
    // "https://travel.rakuten.co.jp/yado/wakayama/wakayama.html/",
    // "https://travel.rakuten.co.jp/yado/wakayama/Kihoku.html/",
    // "https://travel.rakuten.co.jp/yado/wakayama/gobo.html/",
    // "https://travel.rakuten.co.jp/yado/wakayama/shirahama.html/",
    // "https://travel.rakuten.co.jp/yado/wakayama/Katsuura.html/",
    // "https://travel.rakuten.co.jp/yado/wakayama/hongu.html/",
    // "https://travel.rakuten.co.jp/yado/tottori/tottori.html/",
    // "https://travel.rakuten.co.jp/yado/tottori/chubu.html/",
    // "https://travel.rakuten.co.jp/yado/tottori/seibu.html/",
    // "https://travel.rakuten.co.jp/yado/shimane/matsue.html/",
    // "https://travel.rakuten.co.jp/yado/shimane/toubu.html/",
    // "https://travel.rakuten.co.jp/yado/shimane/masuda.html/",
    // "https://travel.rakuten.co.jp/yado/shimane/ritou.html/",
    // "https://travel.rakuten.co.jp/yado/okayama/okayama.html/",
    // "https://travel.rakuten.co.jp/yado/okayama/tsuyama.html/",
    // "https://travel.rakuten.co.jp/yado/okayama/niimi.html/",
    // "https://travel.rakuten.co.jp/yado/okayama/kurashiki.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/hiroshima.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/fukuyama.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/kure.html/",
    // "https://travel.rakuten.co.jp/yado/yamaguchi/iwakuni.html/",
    // "https://travel.rakuten.co.jp/yado/yamaguchi/hagi.html/",
    // "https://travel.rakuten.co.jp/yado/tokushima/tokushima.html/",
    // "https://travel.rakuten.co.jp/yado/tokushima/hokubu.html/",
    // "https://travel.rakuten.co.jp/yado/tokushima/nanbu.html/",
    // "https://travel.rakuten.co.jp/yado/kagawa/takamatsu.html/",
    // "https://travel.rakuten.co.jp/yado/kagawa/sakaide.html/",
    // "https://travel.rakuten.co.jp/yado/kagawa/kotohira.html/",
    // "https://travel.rakuten.co.jp/yado/kagawa/ritou.html/",
    // "https://travel.rakuten.co.jp/yado/ehime/chuuyo.html/",
    // "https://travel.rakuten.co.jp/yado/ehime/touyo.html/",
    // "https://travel.rakuten.co.jp/yado/ehime/saijo.html/",
    // "https://travel.rakuten.co.jp/yado/ehime/nanyo.html/",
    // "https://travel.rakuten.co.jp/yado/kochi/kochi.html/",
    // "https://travel.rakuten.co.jp/yado/kochi/toubu.html/",
    // "https://travel.rakuten.co.jp/yado/kochi/seibu.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/fukuoka.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/seibu.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/kurume.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/buzen.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/chikugo.html/",
    // "https://travel.rakuten.co.jp/yado/saga/saga.html/",
    // "https://travel.rakuten.co.jp/yado/saga/tosu.html/",
    // "https://travel.rakuten.co.jp/yado/saga/karatsu.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/nagasaki.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/unzen.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/airport.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/sasebo.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/ritou.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/tsushima.html/",
    // "https://travel.rakuten.co.jp/yado/nagasaki/iki.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/kumamoto.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/kikuchi.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/aso.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/yatsushiro.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/kuma.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/amakusa.html/",
    // "https://travel.rakuten.co.jp/yado/kumamoto/kurokawa.html/",
    // "https://travel.rakuten.co.jp/yado/oita/oita.html/",
    // "https://travel.rakuten.co.jp/yado/oita/beppu.html/",
    // "https://travel.rakuten.co.jp/yado/oita/yufuin.html/",
    // "https://travel.rakuten.co.jp/yado/oita/taketa.html/",
    // "https://travel.rakuten.co.jp/yado/oita/hita.html/",
    // "https://travel.rakuten.co.jp/yado/oita/kunisaki.html/",
    // "https://travel.rakuten.co.jp/yado/miyazaki/miyazaki.html/",
    // "https://travel.rakuten.co.jp/yado/miyazaki/hokubu.html/",
    // "https://travel.rakuten.co.jp/yado/miyazaki/nanbu.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/kagoshima.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/oosumi.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/kanoya.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/hokusatsu.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/yakushima.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/ritou.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/amami.html/",
    // "https://travel.rakuten.co.jp/yado/kagoshima/okinoerabu.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/nahashi.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/hokubu.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/chubu.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/nanbu.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/kerama.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/kumejima.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/Miyako.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/ritou.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/yonaguni.html/",
    // "https://travel.rakuten.co.jp/yado/okinawa/daito.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/otaru.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/ichinoseki.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/sapporo.html/",
    // "https://travel.rakuten.co.jp/yado/yamagata/yonezawa.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/minami.html/",
    // "https://travel.rakuten.co.jp/yado/ibaraki/kashima.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/kiryu.html/",
    // "https://travel.rakuten.co.jp/yado/saitama/chichibu.html/",
    // "https://travel.rakuten.co.jp/yado/chiba/chiba.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/sagamiko.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/ebina.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/shonan.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/miura.html/",
    // "https://travel.rakuten.co.jp/yado/nagano/madara.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/takayama.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/tajimi.html/",
    // "https://travel.rakuten.co.jp/yado/mie/shima.html/",
    // "https://travel.rakuten.co.jp/yado/kyoto/miyazu.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/chubu.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/kita.html/",
    // "https://travel.rakuten.co.jp/yado/okayama/bizen.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/shohara.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/sandankyo.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/miyajima.html/",
    // "https://travel.rakuten.co.jp/yado/yamaguchi/shimonoseki.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/kitakyusyu.html/",
    // "https://travel.rakuten.co.jp/yado/saga/ureshino.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/chitose.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/niseko.html/",
    // "https://travel.rakuten.co.jp/yado/hokkaido/hakodate.html/",
    // "https://travel.rakuten.co.jp/yado/iwate/morioka.html/",
    // "https://travel.rakuten.co.jp/yado/fukushima/nakadori.html/",
    // "https://travel.rakuten.co.jp/yado/gunma/numata.html/",
    // "https://travel.rakuten.co.jp/yado/kanagawa/sagamihara.html/",
    // "https://travel.rakuten.co.jp/yado/gifu/gero.html/",
    // "https://travel.rakuten.co.jp/yado/shizuoka/yaizu.html/",
    // "https://travel.rakuten.co.jp/yado/hyogo/kasumi.html/",
    // "https://travel.rakuten.co.jp/yado/hiroshima/higashihiroshima.html/",
    // "https://travel.rakuten.co.jp/yado/yamaguchi/yamaguchi.html/",
    // "https://travel.rakuten.co.jp/yado/fukuoka/chikuzen.html/",
    // "https://travel.rakuten.co.jp/yado/tokyo/Ogasawara.html/"
    //     "https://travel.rakuten.co.jp/yado/hokkaido/A.html/",
    //     "https://travel.rakuten.co.jp/yado/hokkaido/B.html/",
    //     "https://travel.rakuten.co.jp/yado/hokkaido/C.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/A.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/B.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/C.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/D.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/E.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/F.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/G.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/H.html/",
    //     "https://travel.rakuten.co.jp/yado/tokyo/I.html/",
    //     "https://travel.rakuten.co.jp/yado/osaka/B.html/",
    //     "https://travel.rakuten.co.jp/yado/osaka/D.html/",
    //     "https://travel.rakuten.co.jp/yado/osaka/C.html/",
    //     "https://travel.rakuten.co.jp/yado/osaka/A.html/",
    //     "https://travel.rakuten.co.jp/yado/kyoto/D.html/",
    //     "https://travel.rakuten.co.jp/yado/kyoto/A.html/",
    //    " https://travel.rakuten.co.jp/yado/kyoto/B.html/",
    //     "https://travel.rakuten.co.jp/yado/kyoto/C.html/",
    //     "https://travel.rakuten.co.jp/yado/kyoto/E.html/",
    //     "https://travel.rakuten.co.jp/yado/aichi/A.html",
    //     "https://travel.rakuten.co.jp/yado/aichi/B.html",
    //     "https://travel.rakuten.co.jp/yado/aichi/C.html"
]
const allPage = []
let allListPage = []
rakutenUrl.forEach(async (url) => {
    const area_1 = url.split('/')[4]
    const area_2 = url.split('/')[5].split('.html')[0]
    /*
    * Steps:
    - Lay ra prefecture va small area
    1. get total records
    2. lay total records / 30
    - Neu <= 1 => lay tong so ban ghi
    - Neu > 1 => lam tron len (vi du: 725 / 30 = 24.167 ~ 25 => luu vao pager tu 2 den 25)
    3. Click url: tu 1 den 25: https://search.travel.rakuten.co.jp/ds/ + prefecture_name/small_name/small_name-p + page
    4. Noi 2 mang: page 1 va cac page con lai
    */
    const getHtmlPlaywright = async url => {
        const browser = await playwright.chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(url, {
            waitUntil: 'load',
            // Remove the timeout
            timeout: 0
        });
        const html = await page.content();
        await browser.close();
        return html;
    };

    const getHtmlAxios = async url => {
        const { data } = await axios.get(url);

        return data;
    };

    const getHtml = async url => {
        return useHeadless ? await getHtmlPlaywright(url) : await getHtmlAxios(url);
    };

    const getPaging = $ =>
        $('.paging').first().find('span em').text();

    const crawl = async url => {
        console.log('Crawl: ', url);
        const html = await getHtml(url);
        const $ = cheerio.load(html);
        const content = getPaging($)
        allPage.push(content)
        let lstPage = []
        let getPage = Math.ceil(content / 30)
        let i = getPage
        while (getPage >= 2) {
            getPage--;
            // if (getPage === 1)
            //     break;
            lstPage.push(getPage)
        }
        let totalPage = lstPage.concat(i);
        allListPage.push({
            "f_chu": area_1, //medium area           
            "f_shou":  $('#dh-detail option').length < 2 ? area_2 : '', //small area
            "f_sai": $('#dh-detail option').length> 1 ? area_2: '',//detail area
            // "f_dist": 
            "f_cd": $('#dh-cd').attr('value'),
            "f_hyoji": $('#dh-search-form').find('input[name="f_hyoji"]').attr('value'),
            "list_page": totalPage
              
        })

        let data = JSON.stringify(allListPage);
        fs.writeFileSync('../result_rakuten/rakuten_paging.json', data);
    };

    // Change the default concurrency or pass it as param
    const queue = (concurrency = 4) => {
        let running = 0;
        const tasks = [];

        return {
            enqueue: async (task, ...params) => {
                tasks.push({ task, params });
                if (running >= concurrency) {
                    return;
                }

                ++running;
                while (tasks.length) {
                    const { task, params } = tasks.shift();
                    await task(...params);
                }
                --running;
            },
        };
    };

    const crawlTask = async url => {
        if (visited.size >= maxVisits) {
            console.log('Over Max Visits, exiting');
            return;
        }

        if (visited.has(url)) {
            return;
        }

        await crawl(url);
    };

    const q = queue();
    q.enqueue(crawlTask, url);
})

