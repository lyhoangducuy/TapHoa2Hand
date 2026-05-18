package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportEvidenceResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportReasonEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportStatusEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportTypeEnumResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Report;
import vn.edu.husc.taphoa2hand_backend.entity.ReportEvidence;
import vn.edu.husc.taphoa2hand_backend.entity.ReportReasonEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportTypeEnum;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReportMapper {
    default ReportReasonEnumResponse mapReason(ReportReasonEnum reason) {
        if (reason == null) return null;

        return ReportReasonEnumResponse.builder()
                .name(reason.name())
                .displayName(reason.getDisplayName())
                .build();
    }

    default ReportTypeEnumResponse mapType(ReportTypeEnum type) {
        if (type == null) return null;

        return ReportTypeEnumResponse.builder()
                .name(type.name())
                .displayName(type.getDisplayName())
                .build();
    }

    default ReportStatusEnumResponse mapStatus(ReportStatusEnum status) {
        if (status == null) return null;

        return ReportStatusEnumResponse.builder()
                .name(status.name())
                .displayName(status.getDisplayName())
                .build();
    }

    @Mapping(source = "reporter.id", target = "reporterId")
    @Mapping(source = "reporter.fullName", target = "reporterName")

    @Mapping(source = "reportedUser.id", target = "reportedUserId")
    @Mapping(source = "reportedUser.fullName", target = "reportedUserName")

    @Mapping(source = "order.id", target = "orderId")

    @Mapping(source = "reportedPost.id", target = "postId")
    @Mapping(source = "reportedPost.title", target = "postTitle")

    @Mapping(source = "evidences", target = "evidences")

    @Mapping(source = "reason", target = "reason")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "status", target = "status")

    @Mapping(source = "detail", target = "detail")

    ReportResponse toReportResponse(Report report);

    @Mapping(source = "reporter.id", target = "reporterId")
    @Mapping(source = "reporter.fullName", target = "reporterName")
    @Mapping(source = "reportedUser.id", target = "reportedUserId")
    @Mapping(source = "reportedUser.fullName", target = "reportedUserName")
    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "reportedPost.id", target = "postId")
    @Mapping(source = "reportedPost.title", target = "postTitle")
    @Mapping(source = "evidences", target = "evidences")
    List<ReportResponse> toReportResponseList(List<Report> reports);

    ReportEvidenceResponse toReportEvidenceResponse(ReportEvidence evidence);

    List<ReportEvidenceResponse> toReportEvidenceResponseList(List<ReportEvidence> evidences);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reporter", ignore = true)
    @Mapping(target = "reportedUser", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "reportedPost", ignore = true)
    @Mapping(target = "evidences", ignore = true)
    @Mapping(target = "status", ignore = true)
    Report toReport(ReportCreateRequest request);
}