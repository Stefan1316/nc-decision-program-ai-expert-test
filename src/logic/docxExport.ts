import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { UserQuery } from '../types/damu';

export interface CoreProgramExport {
  id: string;
  title: string;
  category: string;
  limit: string;
  rate: string;
  term: string;
  purposes: string;
  financier: string;
  sourceId: string;
  url: string;
  note: string;
  applicable: boolean;
}

export async function generateDocxReport(
  query: UserQuery,
  okedName: string,
  corePrograms: CoreProgramExport[],
  excludedPrograms: Array<{ id: string; title: string; instrument: string; reasons: string[]; sourceId: string; url: string }> = [],
  fallback?: {
    show: boolean;
    headline: string;
    explanation: string;
    routes: Array<{ title: string; description: string }>;
    market: {
      baseRate: { ratePercent: number; effectiveFrom: string; sourceUrl: string; checkedOn: string };
      products: Array<{
        institution: string;
        productName: string;
        nominalRateText: string;
        aeirText?: string;
        amountText?: string;
        termText?: string;
        sourceUrl: string;
        checkedOn: string;
      }>;
    };
  }
): Promise<Blob> {
  const normalizedOked = (query.oked_code || '').trim().replace(/,/g, '.').replace(/\\s+/g, '');
  const territoryText = query.district_name
    ? `${query.region_name || query.location_name || 'Не указан регион'} → ${query.district_name}`
    : (query.region_name || query.location_name || 'Не указана');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Заголовок документа
          new Paragraph({
            text: 'NC CONSULTING',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'NC Decision Program — Экспертное заключение по мерам господдержки Фонда «Даму»',
                bold: true,
                size: 26,
                color: '17113D'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Дата формирования: ${new Date().toLocaleDateString('ru-RU')} | Информационная база: АО «ФРП «ДАМУ» (damu.kz)`,
                italics: true,
                size: 18,
                color: '666666'
              })
            ],
            spacing: { after: 280 }
          }),

          // Раздел 1. Исходные параметры запроса
          new Paragraph({
            text: '1. ИСХОДНЫЕ ПАРАМЕТРЫ ПРОЕКТА',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 180, after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Подтверждённый код ОКЭД: ', bold: true }),
              new TextRun({ text: `${normalizedOked} (${okedName})` })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Территория проекта: ', bold: true }),
              new TextRun({ text: territoryText })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Институты финансирования: ', bold: true }),
              new TextRun({ text: 'Банки второго уровня РК (Halyk, Forte, БЦК, Bereke, Jusan и др.) в партнёрстве с АО «ФРП «ДАМУ»' })
            ],
            spacing: { after: 200 }
          }),

          // Раздел 2. Целевые программы по предоставленным данным
          new Paragraph({
            text: '2. ЦЕЛЕВЫЕ ПРОГРАММЫ ФИНАНСИРОВАНИЯ (ПО ПРЕДОСТАВЛЕННЫМ ДАННЫМ)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 140 }
          }),

          ...corePrograms.flatMap((prog, idx) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${idx + 1}. ${prog.title}`,
                  bold: true,
                  size: 22,
                  color: '8B5CFF'
                })
              ],
              spacing: { before: 120, after: 60 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Инструмент поддержки: ', bold: true }),
                new TextRun({ text: prog.category })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Лимит финансирования: ', bold: true }),
                new TextRun({ text: prog.limit, bold: true, color: '006699' })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Ставка и субсидирование: ', bold: true }),
                new TextRun({ text: prog.rate })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Срок и целевое назначение: ', bold: true }),
                new TextRun({ text: `${prog.term} | ${prog.purposes}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Кто финансирует: ', bold: true }),
                new TextRun({ text: prog.financier })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Официальный регламент Damu: ', bold: true }),
                new TextRun({ text: `${prog.sourceId} (${prog.url})` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Обоснование соответствия: ', bold: true, italics: true }),
                new TextRun({ text: prog.note, italics: true })
              ],
              spacing: { after: 160 }
            })
          ]),

          ...(fallback?.show ? [
            new Paragraph({
              text: '3. АЛЬТЕРНАТИВНЫЙ МАРШРУТ ФИНАНСИРОВАНИЯ',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 220, after: 120 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: fallback.headline + '. ', bold: true }),
                new TextRun({ text: fallback.explanation })
              ],
              spacing: { after: 100 }
            }),
            ...fallback.routes.flatMap((route, idx) => [
              new Paragraph({
                children: [new TextRun({ text: `${idx + 1}. ${route.title}`, bold: true })],
                spacing: { before: 80, after: 30 }
              }),
              new Paragraph({
                children: [new TextRun({ text: route.description })],
                spacing: { after: 80 }
              })
            ]),
            new Paragraph({
              children: [
                new TextRun({ text: 'Базовая ставка НБРК: ', bold: true }),
                new TextRun({ text: `${fallback.market.baseRate.ratePercent}% (с ${fallback.market.baseRate.effectiveFrom}). Базовая ставка не является ставкой банковского кредита.` })
              ],
              spacing: { before: 120, after: 80 }
            }),
            new Paragraph({
              children: [new TextRun({ text: 'РЫНОЧНЫЕ ПРОДУКТЫ БВУ', bold: true, color: '006699' })],
              spacing: { before: 100, after: 60 }
            }),
            ...fallback.market.products.flatMap((product, idx) => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${idx + 1}. ${product.institution} — ${product.productName}`, bold: true })
                ],
                spacing: { before: 70, after: 20 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Ставка: ', bold: true }),
                  new TextRun({ text: product.nominalRateText + (product.aeirText ? ` | ${product.aeirText}` : '') })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Параметры: ', bold: true }),
                  new TextRun({ text: [product.amountText, product.termText].filter(Boolean).join(' | ') || 'По условиям банка' })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Официальный источник: ', bold: true }),
                  new TextRun({ text: `${product.sourceUrl} (проверено ${product.checkedOn})` })
                ],
                spacing: { after: 70 }
              })
            ])
          ] : []),

          ...(excludedPrograms.length > 0 ? [
            new Paragraph({
              text: '3. НЕ ПОДХОДЯТ ПО ТЕКУЩИМ ПАРАМЕТРАМ',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 220, after: 120 }
            }),
            ...excludedPrograms.flatMap((prog, idx) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${idx + 1}. ${prog.title}`,
                    bold: true,
                    size: 21,
                    color: 'A61B1B'
                  })
                ],
                spacing: { before: 100, after: 50 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Инструмент: ', bold: true }),
                  new TextRun({ text: prog.instrument })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Причина несоответствия: ', bold: true }),
                  new TextRun({ text: prog.reasons.join('; ') })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Источник: ', bold: true }),
                  new TextRun({ text: `${prog.sourceId}${prog.url ? ` (${prog.url})` : ''}` })
                ],
                spacing: { after: 120 }
              })
            ])
          ] : []),

          // Заключительная правовая часть
          new Paragraph({
            text: '4. РЕГЛАМЕНТ ПРИНЯТИЯ РЕШЕНИЯ',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Заключение сформировано строго на основании предоставленных параметров ОКЭД и территории. Окончательное решение о кредитовании и субсидировании принимается кредитным комитетом банка-партнёра и Фондом «Даму».',
                italics: true,
                size: 18,
                color: '555555'
              })
            ],
            spacing: { after: 200 }
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}
