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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletInfo = exports.createDepositRequest = void 0;
const database_1 = __importDefault(require("../config/database"));
// Giữ nguyên logic generateTransferCode
const generateTransferCode = (userId) => {
    const timestamp = Date.now().toString().slice(-6);
    const userPart = userId.toString().padStart(3, '0');
    return `NAP${userPart}${timestamp}`;
};
/*----------------------------------
 Tạo yêu cầu nạp tiền (PostgreSQL)
-----------------------------------*/
const createDepositRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { amount, proofImage } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Thông tin không hợp lệ' });
        }
        const transferCode = generateTransferCode(Number(userId));
        yield database_1.default.query(`INSERT INTO deposit_requests 
             (user_id, amount, transfer_code, bank_account, proof_image) 
             VALUES ($1, $2, $3, $4, $5)`, [
            userId,
            amount,
            transferCode,
            'MB Bank - 0123456789 - NGUYEN VAN A', // GIỮ NGUYÊN
            proofImage
        ]);
        res.json({
            success: true,
            transferCode,
            bankInfo: {
                bank: 'MB Bank', // GIỮ NGUYÊN
                accountNumber: '0123456789', // GIỮ NGUYÊN
                accountName: 'NGUYEN VAN A', // GIỮ NGUYÊN
                content: transferCode
            }
        });
    }
    catch (error) {
        console.error('Lỗi tạo yêu cầu nạp tiền:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
exports.createDepositRequest = createDepositRequest;
/*----------------------------------
 Lấy thông tin ví (PostgreSQL)
-----------------------------------*/
const getWalletInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Tạo ví nếu chưa có (PG version)
        yield database_1.default.query(`INSERT INTO wallets (user_id) 
             VALUES ($1)
             ON CONFLICT (user_id) DO NOTHING`, [userId]);
        const wallets = yield database_1.default.query(`SELECT * FROM wallets WHERE user_id = $1`, [userId]);
        const deposits = yield database_1.default.query(`SELECT * FROM deposit_requests 
             WHERE user_id = $1 
             ORDER BY created_at DESC`, [userId]);
        res.json({
            wallet: wallets.rows[0],
            depositHistory: deposits.rows
        });
    }
    catch (error) {
        console.error('Lỗi lấy thông tin ví:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
exports.getWalletInfo = getWalletInfo;
