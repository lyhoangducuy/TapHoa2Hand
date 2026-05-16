package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.Report;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    List<Report> findByReporter(Users reporter);

    List<Report> findByReportedUser(Users reportedUser);

    List<Report> findByStatus(ReportStatusEnum status);

    List<Report> findByReporterAndStatus(Users reporter, ReportStatusEnum status);

    List<Report> findByReportedUserAndStatus(Users reportedUser, ReportStatusEnum status);

    List<Report> findByOrderAndStatus(Order order, ReportStatusEnum pending);
}