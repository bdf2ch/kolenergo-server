/**
 * Интерфейс, описывающий сессию пользователя
 */
export interface ISession {
  id: number;           // Идентификатор
  userId: number;       // Идентификатор пользователя
  telegramId: number;   // Идентификатор пользователя Telegram
}
