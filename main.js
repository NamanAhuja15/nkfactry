
const wax = new waxjs.WaxJS({
  rpcEndpoint: 'https://testnet.waxsweden.org',
  tryAutoLogin: true
});
const transport = new AnchorLinkBrowserTransport();
const anchorLink = new AnchorLink({
  transport,
  chains: [{
    chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
    nodeUrl: 'https://testnet.waxsweden.org',
  }],
});
const dapp = "NKFACTORY";
const endpoint = "testnet.waxsweden.org";
const tokenContract = {
  WAX: "eosio.token"
};


var t = 0;

var anchorAuth = "owner";
main();
var loggedIn = false;
var switchtostaked = true;
var collection = 'nkftestnetio';
var switchtoshop = false;
var canclick = false;
var loader = document.getElementById('loader').style;
var overflow = document.getElementById('body').style;

async function main() {

  if (!loggedIn)
  autoLogin();
  else {
    ratespromise = GetConfig();
    rates = await ratespromise;
    console.log("rate " + new Date().toUTCString());
    console.log(rates);

    assetPromise = GetAssets(collection, rates);
    assets = await assetPromise;
    console.log("asset " + new Date().toUTCString());
    console.log(assets);

    stakepromise = FilterStaked(assets);
    staked = await stakepromise;
    console.log("stk " + new Date().toUTCString());
    console.log(staked);

    unstaked = FilterUnstaked(assets, staked);
    console.log("unstaked " + new Date().toUTCString());
    console.log(unstaked);

    balancepromise = GetBalance();
    balance = await balancepromise;
    console.log("balance " + new Date().toUTCString());
    console.log(balance);

    PopulateMenu(rates,assets,staked, unstaked,balance ) 
  }
}
async function GetConfig() {
  var path = "/v1/chain/get_table_rows";

  var data = JSON.stringify({
    json: true,
    code: "nkfactoryyyy",
    scope: "nkfactoryyyy",
    table: "fctrydata",
    limit: 1000,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: {
      "Content-Type": "text/plain"
    },
    body: data,
    method: "POST",
  });

  var rates = [];
  const body = await response.json();

  if (body.rows.length != 0) {
    for (let i = 0; i < body.rows.length; i++) {
      rates.push({
        template_id : body.rows[i].template_id ,
        type: body.rows[i].type,
        token_in: body.rows[i].token_in,
        token_out: body.rows[i].token_out,
        nrgstorage: body.rows[i].nrgstorage,
        rarity: body.rows[i].rarity,
      })
    }
  }
  console.log(rates);
  return rates;
}


function FilterUnstaked(assets, staked) {
  let results = [];
  for (let i = 0; i < assets.length; i++) {
    var check = false;
    for (let j = 0; j < staked.length; j++) {
      if (staked[j].asset_id == assets[i].asset_id)
        check = true;
    }
    if (!check) {
      results.push(assets[i]);
    }
  }
  return results;
}

async function FilterStaked(assets) {

  let results = [];

    var path = "/v1/chain/get_table_rows";
    var data = JSON.stringify({
      json: true,
      code: "nkfactoryyyy",
      scope: "nkfactoryyyy",
      table: "machines",
      key_type: `i64`,
      index_position: 2,
      lower_bound: eosjsName.nameToUint64(wallet_userAccount),
      limit: 2000,
    });

    const response = await fetch("https://" + endpoint + path, {
      headers: {
        "Content-Type": "text/plain"
      },
      body: data,
      method: "POST",
    });

    const body = await response.json();
    if(typeof data !== "undefined"){
  for (let i = 0; i < body.rows.length; i++) {
    var data = body.rows[i];
  for (let i = 0; i < assets.length; i++) {
      if(data.asset_id == assets[i].asset_id && data.owner == wallet_userAccount)
      results.push(
        {
          asset_id:data.asset_id,
          owner:data.owner,
          template_id:data.template_id,
          power:data.power,
          last_claim:data.last_claim,
          delay:data.delay,
          token_in:data.token_in,
          nrgstorage:data.nrgstorage,
          labourer_boost:data.labourer_boost,
          labourer_id:data.labourer_id,
          badge:data.badge,
          craft_id:data.craft_id
        }
      );
    }
  }
}
  return results;
}

async function GetAssets(colc,rates) {
  let results = [];
  var path = "atomicassets/v1/assets?collection_name=" + colc + "&owner=" + wallet_userAccount + "&page=1&limit=1000&order=desc&sort=asset_id";
  const response = await fetch("https://" + "test.wax.api.atomicassets.io/" + path, {
    headers: {
      "Content-Type": "text/plain"
    },
    method: "POST",
  });

  const body = await response.json();

    for(i = 0; i < body.data.length; i++){
      var data = body.data[i];
      for(n = 0; n < rates.length; n++){
        if(data.template.template_id == rates[n].template_id){
               //   rate = parseFloat(rates[j].levels[k].value);
               //   rate_ = lvl > 1 ? parseFloat(lvl)* parseFloat(rate) : rate;
                }
              }
          results.push({
            asset_id: data.asset_id,
            img: data.data.img,
            name: data.name,
          });
        }
        return results;
}


async function GetBalance() {

  var path = "/v1/chain/get_table_rows";

  var data = JSON.stringify({
    json: true,
    code: "nkfactorytkn",
    scope: wallet_userAccount,
    table: "accounts",
    limit: 1000,
  });

  const response = await fetch("https://" + endpoint + path, {
    headers: {
      "Content-Type": "text/plain"
    },
    body: data,
    method: "POST",
  });

  const body = await response.json();

    balance=[];
  if (body.rows.length != 0) {
    for (j = 0; j < body.rows.length; j++) {
      if (body.rows[j].balance.includes("NK"))
        balance.push(body.rows[j].balance);
    }
  }
  return balance;

}



function PopulateMenu(rates,assets,staked, unstakeasset,balance ) {

  document.getElementById('Factory').innerHTML=JSON.stringify(assets, null, 4);

  document.getElementById('All').innerHTML=JSON.stringify(assets, null, 4);
  document.getElementById('Staked').innerHTML = JSON.stringify(staked, null, 4);
  document.getElementById('Unstaked').innerHTML = JSON.stringify(unstakeasset, null, 4);
  document.getElementById('Balance').innerHTML = JSON.stringify(balance, null, 4);
}



function WalletListVisible(visible) {
  document.getElementById("walletlist").style.visibility = visible ?
    "visible" :
    "hidden";
}

function ShowMessage(message) {
  document.getElementById("messagecontent").innerHTML = message;
  document.getElementById("message").style.visibility = "visible";
}

function HideMessage(message) {
  document.getElementById("message").style.visibility = "hidden";
}


function GetSymbol(quantity) {
  var spacePos = quantity.indexOf(" ");
  if (spacePos != -1) {
    return quantity.substr(spacePos + 1)
  }
  return ""
}

async function ShowToast(message) {
  var element = document.getElementById("toast");
  element.innerHTML = message;
  toastU = 0;
  var slideFrac = 0.05;
  var width = element.offsetWidth;
  var right = 16;
  var id = setInterval(frame, 1e3 / 60);
  element.style.right = -width + "px";
  element.style.visibility = "visible";

  function frame() {
    toastU += 0.005;
    if (toastU > 1) {
      clearInterval(id);
      element.style.visibility = "hidden";
    }
    p =
      toastU < slideFrac ?
      toastU / slideFrac / 2 :
      1 - toastU < slideFrac ?
      (1 - toastU) / slideFrac / 2 :
      0.5;
    element.style.right =
      (width + right) * Math.sin(p * Math.PI) - width + "px";
  }
}
async function autoLogin() {
  var isAutoLoginAvailable = await wallet_isAutoLoginAvailable();
  if (isAutoLoginAvailable) {
    login();
  }
}
async function selectWallet(walletType) {
  wallet_selectWallet(walletType);
  login();
}
async function logout() {
  wallet_logout();
  document.getElementById("loggedin").style.display = "none";
  document.getElementById("loggedout").style.display = "block";
  loggedIn = false;
  HideMessage();
}
async function login() {
  try {
    if (!loggedIn) {
      const userAccount = await wallet_login();
      ShowToast("Logged in as: " + userAccount);
      document.getElementById("loggedout").style.display = "none";
      document.getElementById("loggedin").style.display = "block";
      WalletListVisible(false);
      loggedIn = true;
      main();
    }
  } catch (e) {
    ShowToast(e.message);

  }
}
async function wallet_isAutoLoginAvailable() {
  var sessionList = await anchorLink.listSessions(dapp);
  if (sessionList && sessionList.length > 0) {
    useAnchor = true;
    return true;
  } else {
    useAnchor = false;
    return await wax.isAutoLoginAvailable();
  }
}


async function wallet_selectWallet(walletType) {
  useAnchor = walletType == "anchor";
}
async function wallet_login() {
  if (useAnchor) {
    var sessionList = await anchorLink.listSessions(dapp);
    if (sessionList && sessionList.length > 0) {
      wallet_session = await anchorLink.restoreSession(dapp);
    } else {
      wallet_session = (await anchorLink.login(dapp)).session;
    }
    wallet_userAccount = String(wallet_session.auth).split("@")[0];
    auth = String(wallet_session.auth).split("@")[1];
    anchorAuth = auth;

  } else {
    wallet_userAccount = await wax.login();
    wallet_session = wax.api;
    anchorAuth = "active";
  }
  return wallet_userAccount;
}
async function wallet_logout() {
  if (useAnchor) {
    await anchorLink.clearSessions(dapp);
  }
}
async function wallet_transact(actions) {
  if (useAnchor) {
    var result = await wallet_session.transact({
      actions: actions
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    });
    result = {
      transaction_id: result.processed.id
    };
  } else {
    var result = await wallet_session.transact({
      actions: actions
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    });
  }
  return result;
}