
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { NAF } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#0A5483',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#02416D',
  },
  date: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'right',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F8FAFC',
    padding: 5,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
    borderTop: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});

interface BillingReportPDFProps {
  nafs: NAF[];
}

const BillingReportPDF: React.FC<BillingReportPDFProps> = ({ nafs }) => {
  const now = new Date().toLocaleString('pt-BR');

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório de Cobrança Automática</Text>
            <Text style={{ fontSize: 9, color: '#0A5483', marginTop: 2 }}>ProtoCaderno Digital - Gestão de Protocolos</Text>
          </View>
          <Text style={styles.date}>Gerado em: {now}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>NAF</Text></View>
            <View style={[styles.tableColHeader, { width: '35%' }]}><Text style={styles.tableCellHeader}>Fornecedor</Text></View>
            <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>Entrada</Text></View>
            <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>Últ. Cobrança</Text></View>
            <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>Dias</Text></View>
            <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>Status</Text></View>
          </View>

          {nafs.map((naf) => (
            <View style={styles.tableRow} key={naf.id}>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{naf.naf_number}</Text></View>
              <View style={[styles.tableCol, { width: '35%' }]}><Text style={styles.tableCell}>{naf.suppliers?.name || '---'}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{formatDate(naf.entry_date)}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{formatDate(naf.data_cobranca)}</Text></View>
              <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{naf.dias_parados}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text style={[styles.tableCell, { color: '#EF4444', fontWeight: 'bold' }]}>PENDENTE</Text></View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Este documento lista apenas protocolos aptos para cobrança (mais de 10 dias sem atualização).
        </Text>
      </Page>
    </Document>
  );
};

export default BillingReportPDF;
