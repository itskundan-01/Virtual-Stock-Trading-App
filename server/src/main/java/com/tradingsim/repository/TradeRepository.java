package com.tradingsim.repository;

import com.tradingsim.model.Trade;
import com.tradingsim.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByUserOrderByDateDesc(User user);
}
