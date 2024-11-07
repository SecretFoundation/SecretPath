"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var secretjs_1 = require("secretjs");
require("dotenv/config");
var mnemonic = process.env.MNEMONIC;
var endpoint = process.env.LCD_WEB_URL;
var chainId = process.env.CHAIN_ID;
// Returns a client with which we can interact with secret network
var initializeClient = function (endpoint, chainId) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, accAddress, client;
    return __generator(this, function (_a) {
        wallet = new secretjs_1.Wallet(mnemonic);
        accAddress = wallet.address;
        client = new secretjs_1.SecretNetworkClient({
            // Create a client to interact with the network
            url: endpoint,
            chainId: chainId,
            wallet: wallet,
            walletAddress: accAddress
        });
        console.log("\nInitialized client with wallet address: ".concat(accAddress));
        return [2 /*return*/, client];
    });
}); };
var upgradeGateway = function (client, contractPath) { return __awaiter(void 0, void 0, void 0, function () {
    var wasmCode, uploadReceipt, codeIdKv, codeId, contractCodeHash, contractAddress, contract, gatewayInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wasmCode = fs.readFileSync(contractPath);
                console.log("\nUploading gateway contract");
                return [4 /*yield*/, client.tx.compute.storeCode({
                        wasm_byte_code: wasmCode,
                        sender: client.address,
                        source: "",
                        builder: ""
                    }, {
                        gasLimit: 3000000,
                        gasPriceInFeeDenom: 0.05
                    })];
            case 1:
                uploadReceipt = _a.sent();
                if (uploadReceipt.code !== 0) {
                    console.log("Failed to get code id: ".concat(JSON.stringify(uploadReceipt.rawLog)));
                    throw new Error("Failed to upload contract");
                }
                codeIdKv = uploadReceipt.jsonLog[0].events[0].attributes.find(function (a) {
                    return a.key === "code_id";
                });
                console.log("Upload used \u001B[33m".concat(uploadReceipt.gasUsed, "\u001B[0m gas\n"));
                codeId = Number(codeIdKv.value);
                return [4 /*yield*/, client.query.compute.codeHashByCodeId({ code_id: codeId.toString() })];
            case 2:
                contractCodeHash = (_a.sent()).code_hash;
                console.log("Gateway contract code id: ", codeId);
                console.log("Gateway contract code hash: ".concat(contractCodeHash));
                contractAddress = "secret10ex7r7c4y704xyu086lf74ymhrqhypayfk7fkj";
                return [4 /*yield*/, client.tx.compute.migrateContract({
                        sender: client.address,
                        contract_address: contractAddress,
                        code_id: codeId,
                        msg: {
                            migrate: {}
                        }
                    }, {
                        gasLimit: 300000,
                        gasPriceInFeeDenom: 0.05
                    })];
            case 3:
                contract = _a.sent();
                if (contract.code !== 0) {
                    throw new Error("Failed to instantiate the contract with the following error ".concat(contract.rawLog));
                }
                ;
                fs.writeFileSync("secret_gateway.log", "".concat(codeId, "\n").concat(contractCodeHash, "\n").concat(contractAddress, "\n"));
                console.log("Gateway contract address: ".concat(contractAddress, "\n"));
                console.log("Init used \u001B[33m".concat(contract.gasUsed, "\u001B[0m gas\n"));
                gatewayInfo = [contractCodeHash, contractAddress];
                return [2 /*return*/, gatewayInfo];
        }
    });
}); };
function getScrtBalance(userCli) {
    return __awaiter(this, void 0, void 0, function () {
        var balanceResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, userCli.query.bank.balance({
                        address: userCli.address,
                        denom: "uscrt"
                    })];
                case 1:
                    balanceResponse = _a.sent();
                    return [2 /*return*/, balanceResponse.balance.amount];
            }
        });
    });
}
// Initialization procedure
function initializeAndUploadContracts() {
    return __awaiter(this, void 0, void 0, function () {
        var client, balance, _a, gatewayHash, gatewayAddress, clientInfo;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, initializeClient(endpoint, chainId)];
                case 1:
                    client = _b.sent();
                    return [4 /*yield*/, getScrtBalance(client)];
                case 2:
                    balance = _b.sent();
                    console.log("Current SCRT Balance: ".concat(balance));
                    return [4 /*yield*/, upgradeGateway(client, "../TNLS-Gateways/secret/contract.wasm.gz")];
                case 3:
                    _a = _b.sent(), gatewayHash = _a[0], gatewayAddress = _a[1];
                    clientInfo = [
                        client,
                        gatewayHash,
                        gatewayAddress,
                    ];
                    return [2 /*return*/, clientInfo];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, client, gatewayHash, gatewayAddress;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, initializeAndUploadContracts()];
            case 1:
                _a = _b.sent(), client = _a[0], gatewayHash = _a[1], gatewayAddress = _a[2];
                return [2 /*return*/];
        }
    });
}); })();
