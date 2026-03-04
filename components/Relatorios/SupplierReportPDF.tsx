
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Supplier } from '../../types';
import { formatDate } from '../../utils/dateUtils';

// Register fonts if needed, but standard ones are fine for now
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#0A5483',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#02416D',
  },
  date: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0A5483',
    backgroundColor: '#F1F5F9',
    padding: 5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  label: {
    width: 150,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});

interface SupplierReportPDFProps {
  supplier: Supplier;
}

const SupplierReportPDF: React.FC<SupplierReportPDFProps> = ({ supplier }) => {
  const now = new Date().toLocaleString('pt-BR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório de Fornecedor</Text>
            <Text style={{ fontSize: 10, color: '#0A5483', marginTop: 4 }}>ProtoCaderno Digital - Sistema de Gestão</Text>
          </View>
          <Text style={styles.date}>Gerado em: {now}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados de Identificação</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nome / Razão Social:</Text>
            <Text style={styles.value}>{supplier.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>CNPJ / CPF:</Text>
            <Text style={styles.value}>{supplier.document}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>ID do Registro:</Text>
            <Text style={styles.value}>{supplier.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{supplier.email || 'Não informado'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{supplier.phone || 'Não informado'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico e Status</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Data de Cadastro:</Text>
            <Text style={styles.value}>{formatDate(supplier.created_at)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: '#10B981', fontWeight: 'bold' }]}>ATIVO</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Este documento é um relatório oficial gerado pelo sistema ProtoCaderno Digital.
        </Text>
      </Page>
    </Document>
  );
};

export default SupplierReportPDF;
