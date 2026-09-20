# Progumi/backend/app/seeds/seed_history.py
import uuid
from app.database import SessionLocal
from app.dependencies import get_password_hash
from app.models.user import User
from app.models.term import Term
from app.models.quiz_question import QuizQuestion
from app.models.quiz_result import QuizResult
from app.models.quiz_result_history import QuizResultHistory

# 5問分の用語と問題内容
QUESTION_DEFINITIONS = [
    {
        "term_name": "boolean型",
        "question": "boolean型が表せる値はどれですか？",
        "choice_1": "trueまたはfalse",
        "choice_2": "0〜255の整数",
        "choice_3": "文字列",
        "choice_4": "配列",
        "correct_choice": 1,
        "selected_choice": 1,  # 正解を選択
    },
    {
        "term_name": "number型",
        "question": "number型が表現できるものはどれですか？",
        "choice_1": "真偽値",
        "choice_2": "整数および浮動小数点数",
        "choice_3": "文字列",
        "choice_4": "関数",
        "correct_choice": 2,
        "selected_choice": 2,  # 正解を選択
    },
    {
        "term_name": "string型",
        "question": "string型の説明として正しいものはどれですか？",
        "choice_1": "真偽値を表す",
        "choice_2": "整数のみを表す",
        "choice_3": "文字列を表す",
        "choice_4": "配列を表す",
        "correct_choice": 3,
        "selected_choice": 3,  # 正解を選択
    },
    {
        "term_name": "配列型",
        "question": "配列型の定義方法として正しいものはどれですか？",
        "choice_1": "Type[] または Array<T>",
        "choice_2": "Type{} のみ",
        "choice_3": "Type() のみ",
        "choice_4": "定義方法は存在しない",
        "correct_choice": 1,
        "selected_choice": 1,  # 正解を選択
    },
    {
        "term_name": "オブジェクト型",
        "question": "オブジェクト型の特徴として正しいものはどれですか？",
        "choice_1": "単一の値のみを持つ",
        "choice_2": "複数のプロパティを持つデータ構造を定義できる",
        "choice_3": "数値型の一種である",
        "choice_4": "関数のみを持つ",
        "correct_choice": 2,
        "selected_choice": 1,  # 不正解を選択（誤答パターン）
    },
]


def seed():
    db = SessionLocal()
    try:
        # 1. シードユーザー
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("シードユーザーは既に存在します。スキップします。")
            user = existing_user
        else:
            user = User(
                id=uuid.uuid4(),
                name="テストユーザー",
                email="test@example.com",
                password_hash=get_password_hash("password123"),
                role="user",
            )
            db.add(user)
            db.flush()
            print(
                "シードユーザーを作成しました（email: test@example.com / password: password123）"
            )

        # 2. quiz_resultsが既に存在するか確認
        existing_result = (
            db.query(QuizResult).filter(QuizResult.user_id == user.id).first()
        )
        if existing_result:
            print("シードユーザーのquiz_resultsは既に存在します。スキップします。")
            return

        # 3. 5問分のquiz_questionsを作成（既存termsを参照）
        questions = []
        for q_def in QUESTION_DEFINITIONS:
            term = db.query(Term).filter(Term.term == q_def["term_name"]).first()
            if not term:
                print(
                    f"termsデータが見つかりません: {q_def['term_name']}。seed_terms.pyを先に実行してください。"
                )
                return

            existing_q = (
                db.query(QuizQuestion)
                .filter(
                    QuizQuestion.term_id == term.id,
                    QuizQuestion.question == q_def["question"],
                )
                .first()
            )
            if existing_q:
                question = existing_q
            else:
                question = QuizQuestion(
                    id=uuid.uuid4(),
                    term_id=term.id,
                    question=q_def["question"],
                    choice_1=q_def["choice_1"],
                    choice_2=q_def["choice_2"],
                    choice_3=q_def["choice_3"],
                    choice_4=q_def["choice_4"],
                    correct_choice=q_def["correct_choice"],
                )
                db.add(question)

            questions.append((question, q_def))

        db.flush()

        # 4. quiz_resultsの作成（5問中4問正解）
        result1 = QuizResult(
            id=uuid.uuid4(),
            user_id=user.id,
            total_questions=5,
            correct_answers=4,
            score=80,
        )
        db.add(result1)
        db.flush()

        # 5. quiz_result_historiesの作成（5件）
        histories = []
        for question, q_def in questions:
            selected = q_def["selected_choice"]
            is_correct = selected == q_def["correct_choice"]
            histories.append(
                QuizResultHistory(
                    id=uuid.uuid4(),
                    quiz_result_id=result1.id,
                    question_id=question.id,
                    selected_choice=selected,
                    is_correct=is_correct,
                )
            )
        db.add_all(histories)

        db.commit()
        print("✅ 学習履歴のシードデータ投入が完了しました！")
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
