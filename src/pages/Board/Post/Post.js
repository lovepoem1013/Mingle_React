import styles from "./Post.module.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "../../../App";
import Reply from "../components/Reply/Reply";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faEye, faClock } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import ReadOnlyQuill from "../../../components/QuillEditor/ReadOnlyQuill";
import { useNavigate } from "react-router-dom";
import { timeFormatter } from "../../../components/TimeFormatter/TimeFormatter";
import ReportPostModal from "../components/ReportPostModal/ReportPostModal";

const Post = () => {

    const { postId } = useParams();
    const { loginId, loginRole, loginStatus } = useContext(LoginContext);
    const [post, setPost] = useState(null);
    // 좋아요와 싫어요 상태
    const [vote, setVote] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 로그인 여부
    useEffect(() => {
        if (loginStatus !== "confirm")
            setIsLoading(true);
        else {
            if (loginId === "") {
                navigate("/denied");
            }
            setIsLoading(false);
        }
    }, [loginId, loginStatus]);


    const [reportModalOpen, setReportModalOpen] = useState(false); // 신고 모달 상태 추가

    // 신고 모달 열기 함수
    const handleReport = () => {
        setReportModalOpen(true);
    };

    // 신고 모달 닫기 함수
    const closeReportModal = () => {
        setReportModalOpen(false);
    };



    // 좋아요 클릭 핸들러
    const handleLike = () => {
        if (loginId === null || loginId === "") {
            alert("로그인을 하지 않으면 투표를 할 수 없습니다!");
            return;
        }
        if (post.member.id !== loginId && loginId) {
            axios.post(`/api/post/${postId}/like`, null, {
                params: { memberId: loginId }
            })
                .then(response => {
                    setVote(response.data); // 서버에서 반환한 총 추천 수로 업데이트
                })
                .catch(error => {
                    alert("해당 게시글에 이미 투표를 완료하셨습니다.");
                });
        }
        else {
            alert("본인 게시글에는 투표할 수 없습니다!")
        }

    };

    // 싫어요 클릭 핸들러
    const handleDislike = () => {
        if (loginId === null || loginId === "") {
            alert("로그인을 하지 않으면 추천을 할 수 없습니다!");
            return;
        }
        if (post.member.id !== loginId) {
            axios.post(`/api/post/${postId}/dislike`, null, {
                params: { memberId: loginId }
            })
                .then(response => {
                    setVote(response.data);
                })
                .catch(error => {
                    alert("해당 게시글에 이미 투표를 완료하셨습니다.");
                });
        }
        else {
            alert("본인 게시글에는 투표할 수 없습니다!")
        }

    };

    const handleDelete = () => {
        const userResponse = window.confirm("정말 게시글을 삭제하시겠습니까?");
        if (userResponse) {
            axios.delete(`/api/post/${postId}`).then(resp => {
                navigate("/board");
            }).catch(error => {
                alert("게시글 삭제에 실패했습니다.");
                console.error("error : " + error);
            })
        } else {
            return;
        }
    }


    // 파일 다운로드 함수
    const downloadFile = (sysName, oriName) => {
        axios.get(`/api/post/file/download`, {
            params: { sysName: sysName, oriName: oriName },
            responseType: "blob"
        })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', oriName); // 다운로드 파일 이름 설정
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => console.error("다운로드 중 오류 발생:", error));
    }

    const handleUpdate = () => {
        navigate(`/board/updatepost/${postId}`)
    }

    useEffect(() => {
        setIsLoading(true);

        const viewedPosts = sessionStorage.getItem('viewedPosts') ? JSON.parse(sessionStorage.getItem('viewedPosts')) : [];

        const fetchPostData = axios.get(`/api/post/${postId}`);
        const fetchVoteCount = axios.get(`/api/post/likes/${postId}`);

        Promise.all([fetchPostData, fetchVoteCount]).then(responses => {
            const [postDataResponse, voteCountResponse] = responses;

            console.log(postDataResponse.data);

            setPost(postDataResponse.data);
            setVote(voteCountResponse.data);

            if (!viewedPosts.includes(postId)) {
                axios.put(`/api/post/updateViewCount/${postId}`).then(resp => {

                    viewedPosts.push(postId);
                    sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
                }).catch(error => {
                    console.error("error", error);
                });
            }

        }).catch(error => {
            console.error("error", error);
        }).finally(() => {
            setIsLoading(false);
        });

    }, [postId, loginId]);


    let voteClass = '';
    if (vote > 0) {
        voteClass = styles.votePositive;
    } else if (vote < 0) {
        voteClass = styles.voteNegative;
    }

    if (isLoading) {
        return (
            <div>
                <LoadingSpinner></LoadingSpinner>
            </div>

        );

    }

    return (

        <div className={styles.board}>

            <ReportPostModal
                isOpen={reportModalOpen}
                onRequestClose={closeReportModal}
                contentLabel="게시글 신고하기"
                postId={postId}
            />
            {post && (
                <div className={styles.post__container}>
                    <h1 className={styles.post__title}>{post.title}</h1>
                    <hr />
                    <div className={styles.post__header}>
                        <p className={styles.post__author}>작성자 : {post.member.nickname}</p>
                    </div>
                    <hr />
                    <div className={styles.infoDiv}>
                        <FontAwesomeIcon icon={faClock} className={styles.infoIcon} />
                        <span className={styles.infoText}>{`등록시간 : ${timeFormatter(post.writeDate)}`}</span> &nbsp;
                        <FontAwesomeIcon icon={faEye} className={styles.infoIcon} />
                        <span className={styles.infoText}>{`조회수 : ${post.viewCount}`}</span>
                    </div>
                    <div className={styles.post__content}>
                        <ReadOnlyQuill content={post.content}></ReadOnlyQuill>
                    </div>
                    {/* 좋아요와 싫어요 버튼 */}
                    <div className={styles.reactionButtons}>
                        <button onClick={handleLike} className={styles.likeButton}>
                            <FontAwesomeIcon icon={faThumbsUp} /> 좋아요
                        </button>
                        <div className={`${styles.voteCount} ${voteClass}`}>
                            {vote}
                        </div>
                        <button onClick={handleDislike} className={styles.dislikeButton}>
                            <FontAwesomeIcon icon={faThumbsDown} /> 싫어요
                        </button>
                    </div>
                    <div className={styles.fileDownloadSection}>
                        {post.files && post.files.map(file => (
                            <div key={file.id} onClick={() => downloadFile(file.sysName, file.oriName)}>
                                <button className={styles.fileDownloadButton} type="button">{file.oriName}</button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.post__replies}>
                        <Reply replies={post.replies} postId={postId} />
                    </div>
                </div>

            )}


            <div className={styles.buttonDiv}>
                {
                    post && !post.isNotice && (
                        <button onClick={handleReport} className={styles.reportButton}>
                            게시글 신고하기
                        </button>

                    )
                }
                {

                    post && (post.member.id === loginId || loginRole === "ROLE_ADMIN") && (
                        <>
                            <button onClick={handleDelete} className={styles.deleteButton}>
                                게시글 삭제하기
                            </button>
                            <button onClick={handleUpdate} className={styles.updateButton}>
                                게시글 수정하기
                            </button>
                        </>
                    )
                }

            </div>




        </div>
    );
};

export default Post;