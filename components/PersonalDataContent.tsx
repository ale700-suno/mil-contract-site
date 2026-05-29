export function PersonalDataContent() {
  return (
    <div className="space-y-4">
      <div>
        При отправке заявки Пользователь предоставляет персональные данные (например,
        ФИО и телефон) для связи и консультации по вопросам оформления.
      </div>
      <div>
        <div className="font-semibold text-white">Какие данные обрабатываются</div>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>ФИО</li>
          <li>Телефон</li>
          <li>Telegram username (при наличии)</li>
          <li>Регион проживания</li>
          <li>Комментарий к заявке (если указан)</li>
        </ul>
      </div>
      <div>
        <div className="font-semibold text-white">Для чего</div>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>обработка заявки;</li>
          <li>обратная связь и консультирование;</li>
          <li>подбор региона/условий;</li>
          <li>сопровождение на этапах оформления.</li>
        </ul>
      </div>
      <div>
        Пользователь может отозвать согласие, написав в Telegram:{" "}
        <a
          href="https://t.me/FmSn5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline decoration-white/30 hover:decoration-white/70"
        >
          https://t.me/FmSn5
        </a>
      </div>
    </div>
  );
}
