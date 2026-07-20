import type { SpecialCharacterCategory, SpecialCharacterItem } from '../types';

function characters(label: string, values: string): SpecialCharacterItem[] {
    return [...values].filter((value) => value !== ' ').map((value) => ({ value, label }));
}

const currency: SpecialCharacterItem[] = [
    ...characters('Currency symbol', '$¢€£¥¤₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺₼₽₾₿'),
];
const text: SpecialCharacterItem[] = [...characters('Text symbol', '©®™℠℗§¶†‡•‣‧‰‱№℅ℓ℮℞ℹ')];
const quotations: SpecialCharacterItem[] = [...characters('Quotation mark', '‘’‚‛“”„‟‹›«»′″‴‵‶‷')];
const mathematical: SpecialCharacterItem[] = [
    ...characters('Mathematical symbol', '±×÷−√∞≈≠≤≥∑∏∫∂∆∇∈∉∋∅∧∨∩∪∝∠∴∵⊂⊃⊆⊇⊕⊗'),
];
const extendedLatin: SpecialCharacterItem[] = [
    ...characters(
        'Extended Latin character',
        'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
    ),
];
const symbols: SpecialCharacterItem[] = [...characters('Symbol', '✓✔✕✖★☆♠♣♥♦♪♫☀☁☂☃☎⌛⌚⚑⚐⚠⚡')];
const arrows: SpecialCharacterItem[] = [...characters('Arrow', '←↑→↓↔↕↖↗↘↙⇐⇑⇒⇓⇔⇕➔➜➝➞➟➠')];
const greek: SpecialCharacterItem[] = [
    ...characters('Greek character', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω'),
];

export const SPECIAL_CHARACTER_CATEGORIES: SpecialCharacterCategory[] = [
    { name: 'Currency', items: currency },
    { name: 'Text', items: text },
    { name: 'Quotations', items: quotations },
    { name: 'Mathematical', items: mathematical },
    { name: 'Extended Latin', items: extendedLatin },
    { name: 'Symbols', items: symbols },
    { name: 'Arrows', items: arrows },
    { name: 'Greek', items: greek },
];

export const ALL_SPECIAL_CHARACTERS = SPECIAL_CHARACTER_CATEGORIES.flatMap(
    (category) => category.items,
);
