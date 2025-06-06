package com.tradingsim.repository;

import com.tradingsim.model.Transaction;
import com.tradingsim.model.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletOrderByCreatedAtDesc(Wallet wallet);
    Page<Transaction> findByWallet(Wallet wallet, Pageable pageable);
}
