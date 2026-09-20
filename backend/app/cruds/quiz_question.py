# Progumi/backend/app/cruds/quiz_question.py
import os
import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from app.models.term import Term
from app.models.quiz_question import QuizQuestion

# 1. APIキーの設定（環境変数から確実に取得）
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in environment variables.")

genai.configure(api_key=api_key)


# 2. 用語取得関数
def get_random_terms(db: Session, category: str = None, limit: int = 5):
    query = db.query(Term)
    if category:
        query = query.filter(Term.category == category)

    terms = query.order_by(func.random()).limit(limit).all()

    if len(terms) < limit:
        needed = limit - len(terms)
        existing_ids = [t.id for t in terms]
        supplement = (
            db.query(Term)
            .filter(Term.id.notin_(existing_ids))
            .order_by(func.random())
            .limit(needed)
            .all()
        )
        terms.extend(supplement)
    return terms


# # 3. クイズ生成関数（安全にデータを取り出すように修正）
# def generate_and_save_quizzes(db: Session, terms_data: list):
#     # 安定性を優先して 2.5-flash を指定
#     model = genai.GenerativeModel('models/gemini-2.5-flash')

#     # 【修正箇所】辞書かオブジェクトかを問わず、安全に値を取得する
#     processed_terms = []
#     for t in terms_data:
#         term_val = getattr(t, "term", "不明")
#         desc_val = getattr(t, "description", "解説なし")
#         processed_terms.append(f"- 用語: {term_val}, 解説: {desc_val}")

#     terms_text = "\n".join(processed_terms)

#     prompt = f"""
#     以下の用語と解説をもとに、5問の4択クイズを作成してください。

#     {terms_text}

#     【出力形式のルール】
#     - JSONの配列形式（キー: "questions"）のみを返してください。
#     - 説明や挨拶は不要です。
#     {{
#       "questions": [
#         {{
#           "question": "問題文",
#           "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
#           "correct_answer_index": 0
#         }}
#       ]
#     }}
#     """

#     response = model.generate_content(prompt)

#     # 応答からJSON部分を抽出
#     raw_text = response.text.replace("```json", "").replace("```", "").strip()

#     # JSONパースの失敗を防ぐため、try-exceptを入れるのが理想ですが、まずはこれで動かしましょう
#     return json.loads(raw_text)


# 3. クイズ生成関数（エラー確認用）
def generate_and_save_quizzes(db: Session, terms_data: list):
    model = genai.GenerativeModel("models/gemini-2.5-flash")

    processed_terms = []
    for t in terms_data:
        # ① 辞書として渡されてくるので .get() で取得する
        term_val = t.get("term") if isinstance(t, dict) else getattr(t, "term", "不明")
        desc_val = (
            t.get("description")
            if isinstance(t, dict)
            else getattr(t, "description", "解説なし")
        )
        processed_terms.append(f"- 用語: {term_val}, 解説: {desc_val}")

    terms_text = "\n".join(processed_terms)

    # ② プロンプトで出力形式を厳密に指定し、余計なテキストを返させない
    prompt = f"""
以下の用語と解説をもとに、5問の4択クイズを作成してください。

{terms_text}

【厳守事項】
- 前置きや説明は一切不要です。JSONのみを返してください。
- 以下のJSON形式で返してください。

{{
  "questions": [
    {{
      "question": "問題文",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "correct_answer_index": 0
    }}
  ]
}}
"""

    try:
        response = model.generate_content(prompt)

        # ③ ```json〜``` を剥がした後、{ から } までのJSONブロックだけを抽出する
        raw_text = response.text
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        json_text = raw_text[start:end]
        parsed = json.loads(json_text)

        # Geminiの結果をDBに保存してidを付与する
        saved_questions = []
        for i, q in enumerate(parsed["questions"]):
            # term_idはterms_dataのインデックスに対応
            term_id = (
                terms_data[i].get("id")
                if isinstance(terms_data[i], dict)
                else getattr(terms_data[i], "id", None)
            )

            new_question = QuizQuestion(
                term_id=term_id,
                question=q["question"],
                choice_1=q["options"][0],
                choice_2=q["options"][1],
                choice_3=q["options"][2],
                choice_4=q["options"][3],
                correct_choice=q["correct_answer_index"],
            )
            db.add(new_question)
            db.flush()  # ★ commitせずにidを取得

            saved_questions.append(
                {
                    "id": new_question.id,  # ★ DBで発行されたUUID
                    "question": q["question"],
                    "options": q["options"],
                    "correct_answer_index": q["correct_answer_index"],
                }
            )

        db.commit()
        return {"questions": saved_questions}

    except Exception as e:
        raise e
