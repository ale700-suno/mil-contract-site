"use client";

import {
  useState,
  type FormEvent,
} from "react";

type FormSource = "quick" | "contacts";

type ApplicationFormProps = {
  source: FormSource;
  showComment?: boolean;
};

const fieldClassName =
  "w-full px-4 py-4 bg-black/60 border border-white/10 rounded-2xl outline-none focus:border-white/40 transition";

export function ApplicationForm({
  source,
  showComment = false,
}: ApplicationFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [region, setRegion] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/application",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            telegram,
            region,
            comment: showComment
              ? comment
              : undefined,
            source,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          data.error ??
            "Не удалось отправить заявку"
        );
        return;
      }

      setStatus("success");
      setName("");
      setPhone("");
      setTelegram("");
      setRegion("");
      setComment("");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Нет соединения с сервером"
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <input
        required
        name="name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Имя"
        className={fieldClassName}
        disabled={isLoading}
      />
      <input
        required
        name="phone"
        type="tel"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        placeholder="Телефон"
        className={fieldClassName}
        disabled={isLoading}
      />
      <input
        name="telegram"
        value={telegram}
        onChange={(e) =>
          setTelegram(e.target.value)
        }
        placeholder="Telegram"
        className={fieldClassName}
        disabled={isLoading}
      />
      <input
        required
        name="region"
        value={region}
        onChange={(e) =>
          setRegion(e.target.value)
        }
        placeholder="Регион"
        className={fieldClassName}
        disabled={isLoading}
      />

      {showComment && (
        <textarea
          name="comment"
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          placeholder="Комментарий"
          className={
            fieldClassName +
            " h-32 resize-none"
          }
          disabled={isLoading}
        />
      )}

      {status === "success" && (
        <p className="text-sm text-emerald-400">
          Заявка отправлена. Мы свяжемся с вами.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
      >
        {isLoading
          ? "Отправка…"
          : "Отправить заявку"}
      </button>
    </form>
  );
}
