import { Request, Response } from 'express';
import pool from '../config/database';

// Giữ nguyên logic generateTransferCode
const generateTransferCode = (userId: number): string => {
    const timestamp = Date.now().toString().slice(-6);
    const userPart = userId.toString().padStart(3, '0');
    return `NAP${userPart}${timestamp}`;
};

/*----------------------------------
 Tạo yêu cầu nạp tiền (PostgreSQL)
-----------------------------------*/
export const createDepositRequest = async (req: Request, res: Response) => {
    try {
        const { amount, proofImage } = req.body;
        const userId = req.user?.userId;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Thông tin không hợp lệ' });
        }

        const transferCode = generateTransferCode(Number(userId));

        await pool.query(
            `INSERT INTO deposit_requests 
             (user_id, amount, transfer_code, bank_account, proof_image) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
                userId,
                amount,
                transferCode,
                'MB Bank - 0123456789 - NGUYEN VAN A', // GIỮ NGUYÊN
                proofImage
            ]
        );

        res.json({
            success: true,
            transferCode,
            bankInfo: {
                bank: 'MB Bank',                  // GIỮ NGUYÊN
                accountNumber: '0123456789',      // GIỮ NGUYÊN
                accountName: 'NGUYEN VAN A',      // GIỮ NGUYÊN
                content: transferCode
            }
        });
    } catch (error) {
        console.error('Lỗi tạo yêu cầu nạp tiền:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

/*----------------------------------
 Lấy thông tin ví (PostgreSQL)
-----------------------------------*/
export const getWalletInfo = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Tạo ví nếu chưa có (PG version)
        await pool.query(
            `INSERT INTO wallets (user_id) 
             VALUES ($1)
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
        );

        const wallets = await pool.query(
            `SELECT * FROM wallets WHERE user_id = $1`,
            [userId]
        );

        const deposits = await pool.query(
            `SELECT * FROM deposit_requests 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            wallet: wallets.rows[0],
            depositHistory: deposits.rows
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin ví:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
