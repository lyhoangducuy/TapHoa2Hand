package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportEvidenceResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Report;
import vn.edu.husc.taphoa2hand_backend.entity.ReportEvidence;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReportMapper {

    @Mapping(source = "reporter.id", target = "reporterId")
    @Mapping(source = "reporter.fullName", target = "reporterName")
    @Mapping(source = "reportedUser.id", target = "reportedUserId")
    @Mapping(source = "reportedUser.fullName", target = "reportedUserName")
    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "evidences", target = "evidences")
    ReportResponse toReportResponse(Report report);

    List<ReportResponse> toReportResponseList(List<Report> reports);

    ReportEvidenceResponse toReportEvidenceResponse(ReportEvidence evidence);

    List<ReportEvidenceResponse> toReportEvidenceResponseList(List<ReportEvidence> evidences);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reporter", ignore = true)
    @Mapping(target = "reportedUser", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "evidences", ignore = true)
    @Mapping(target = "status", ignore = true)
    Report toReport(ReportCreateRequest request);
}